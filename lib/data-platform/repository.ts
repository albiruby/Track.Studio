import { Connection, SyncAttempt } from './types';
import { getFirebaseFirestore } from '../firebase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy,
  limit 
} from 'firebase/firestore';
import { DatabaseError } from '../utils/errors';

function isOfflineError(error: any): boolean {
  if (!error) return false;
  const msg = error.message || String(error);
  const code = error.code;
  return (
    msg.includes('offline') ||
    msg.includes('unreachable') ||
    msg.includes('network') ||
    msg.includes('unavailable') ||
    msg.includes('failed-precondition') ||
    code === 'unavailable' ||
    code === 'failed-precondition' ||
    (typeof window !== 'undefined' && !window.navigator.onLine)
  );
}

class ConnectionFallbackStorage {
  private static memoryDb: Record<string, any> = {};

  private static getStorageKey(collectionName: string, userId: string): string {
    return `trackstudio_conn_fallback_${userId}_${collectionName}`;
  }

  static getList<T>(collectionName: string, userId: string): T[] {
    const key = this.getStorageKey(collectionName, userId);
    const prefix = `${userId}:${collectionName}:`;
    const memItems = Object.keys(this.memoryDb)
      .filter((k) => k.startsWith(prefix))
      .map((k) => this.memoryDb[k]);

    if (memItems.length > 0) {
      return memItems;
    }

    try {
      if (typeof window !== 'undefined') {
        const dataStr = localStorage.getItem(key);
        if (dataStr) {
          const items = JSON.parse(dataStr);
          if (items) {
            const list = Object.values(items) as T[];
            list.forEach((item: any) => {
              const id = item.providerId || item.id || 'item';
              this.memoryDb[`${userId}:${collectionName}:${id}`] = item;
            });
            return list;
          }
        }
      }
    } catch (e) {
      console.warn('ConnectionFallbackStorage: localStorage list failed', e);
    }
    return [];
  }

  static save<T>(collectionName: string, userId: string, id: string, data: T): void {
    const memKey = `${userId}:${collectionName}:${id}`;
    this.memoryDb[memKey] = data;

    try {
      if (typeof window !== 'undefined') {
        const key = this.getStorageKey(collectionName, userId);
        const dataStr = localStorage.getItem(key);
        const items = dataStr ? JSON.parse(dataStr) : {};
        items[id] = data;
        localStorage.setItem(key, JSON.stringify(items));
      }
    } catch (e) {
      console.warn('ConnectionFallbackStorage: localStorage write failed', e);
    }
  }

  static delete(collectionName: string, userId: string, id: string): void {
    const memKey = `${userId}:${collectionName}:${id}`;
    delete this.memoryDb[memKey];

    try {
      if (typeof window !== 'undefined') {
        const key = this.getStorageKey(collectionName, userId);
        const dataStr = localStorage.getItem(key);
        if (dataStr) {
          const items = JSON.parse(dataStr);
          delete items[id];
          localStorage.setItem(key, JSON.stringify(items));
        }
      }
    } catch (e) {
      console.warn('ConnectionFallbackStorage: localStorage delete failed', e);
    }
  }
}

export class ConnectionRepository {
  /**
   * Retrieves all active connections for the current authenticated user.
   */
  static async getConnections(userId: string): Promise<Connection[]> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      return ConnectionFallbackStorage.getList<Connection>('connections', userId);
    }

    try {
      const connsRef = collection(firestore, 'users', userId, 'connections');
      const qSnap = await getDocs(connsRef);
      const connections: Connection[] = [];
      qSnap.forEach((docSnap) => {
        const conn = docSnap.data() as Connection;
        connections.push(conn);
        ConnectionFallbackStorage.save('connections', userId, conn.providerId, conn);
      });
      return connections;
    } catch (e: any) {
      if (isOfflineError(e)) {
        console.warn('getConnections: Firestore offline. Loading from fallback.');
        return ConnectionFallbackStorage.getList<Connection>('connections', userId);
      }
      console.error('Firestore getConnections failed:', e);
      throw new DatabaseError(e.message || 'Failed to retrieve connection feeds from database.');
    }
  }

  /**
   * Saves or updates a connection record.
   */
  static async saveConnection(connection: Connection): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      ConnectionFallbackStorage.save('connections', connection.userId, connection.providerId, connection);
      return;
    }

    try {
      const docRef = doc(firestore, 'users', connection.userId, 'connections', connection.providerId);
      await setDoc(docRef, connection);
      ConnectionFallbackStorage.save('connections', connection.userId, connection.providerId, connection);
    } catch (e: any) {
      if (isOfflineError(e)) {
        console.warn('saveConnection: Firestore offline. Saved locally.');
        ConnectionFallbackStorage.save('connections', connection.userId, connection.providerId, connection);
        return;
      }
      console.error('Firestore saveConnection failed:', e);
      throw new DatabaseError(e.message || 'Failed to persist connection record.');
    }
  }

  /**
   * Deletes a connection.
   */
  static async deleteConnection(userId: string, providerId: string): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      ConnectionFallbackStorage.delete('connections', userId, providerId);
      return;
    }

    try {
      const docRef = doc(firestore, 'users', userId, 'connections', providerId);
      await deleteDoc(docRef);
      ConnectionFallbackStorage.delete('connections', userId, providerId);
    } catch (e: any) {
      if (isOfflineError(e)) {
        console.warn('deleteConnection: Firestore offline. Deleted locally.');
        ConnectionFallbackStorage.delete('connections', userId, providerId);
        return;
      }
      console.error('Firestore deleteConnection failed:', e);
      throw new DatabaseError(e.message || 'Failed to remove connection from database.');
    }
  }

  /**
   * Get historical sync logs.
   */
  static async getSyncHistory(userId: string, providerId: string): Promise<SyncAttempt[]> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      return ConnectionFallbackStorage.getList<SyncAttempt>(`syncHistory_${providerId}`, userId).slice(0, 20);
    }

    try {
      const historyRef = collection(firestore, 'users', userId, 'connections', providerId, 'syncHistory');
      const q = query(historyRef, orderBy('timestamp', 'desc'), limit(20));
      const qSnap = await getDocs(q);
      const history: SyncAttempt[] = [];
      qSnap.forEach((docSnap) => {
        const attempt = docSnap.data() as SyncAttempt;
        history.push(attempt);
        ConnectionFallbackStorage.save(`syncHistory_${providerId}`, userId, attempt.id, attempt);
      });
      return history;
    } catch (e: any) {
      if (isOfflineError(e)) {
        console.warn('getSyncHistory: Firestore offline. Loading from fallback.');
        return ConnectionFallbackStorage.getList<SyncAttempt>(`syncHistory_${providerId}`, userId).slice(0, 20);
      }
      console.error('Firestore getSyncHistory failed:', e);
      // We don't want to crash the UI for sync history errors, return empty list or fallback list
      return ConnectionFallbackStorage.getList<SyncAttempt>(`syncHistory_${providerId}`, userId).slice(0, 20);
    }
  }

  /**
   * Log a new sync attempt.
   */
  static async saveSyncAttempt(userId: string, providerId: string, attempt: SyncAttempt): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      ConnectionFallbackStorage.save(`syncHistory_${providerId}`, userId, attempt.id, attempt);
      return;
    }

    try {
      const docRef = doc(firestore, 'users', userId, 'connections', providerId, 'syncHistory', attempt.id);
      await setDoc(docRef, attempt);
      ConnectionFallbackStorage.save(`syncHistory_${providerId}`, userId, attempt.id, attempt);
    } catch (e: any) {
      if (isOfflineError(e)) {
        console.warn('saveSyncAttempt: Firestore offline. Saved locally.');
        ConnectionFallbackStorage.save(`syncHistory_${providerId}`, userId, attempt.id, attempt);
        return;
      }
      console.error('Firestore saveSyncAttempt failed:', e);
      throw new DatabaseError(e.message || 'Failed to save synchronization log.');
    }
  }
}
