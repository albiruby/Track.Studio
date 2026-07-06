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

export class ConnectionRepository {
  /**
   * Retrieves all active connections for the current authenticated user.
   */
  static async getConnections(userId: string): Promise<Connection[]> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      throw new DatabaseError('Database service is not configured or offline.');
    }

    try {
      const connsRef = collection(firestore, 'users', userId, 'connections');
      const qSnap = await getDocs(connsRef);
      const connections: Connection[] = [];
      qSnap.forEach((docSnap) => {
        connections.push(docSnap.data() as Connection);
      });
      return connections;
    } catch (e: any) {
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
      throw new DatabaseError('Database service is not configured or offline.');
    }

    try {
      const docRef = doc(firestore, 'users', connection.userId, 'connections', connection.providerId);
      await setDoc(docRef, connection);
    } catch (e: any) {
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
      throw new DatabaseError('Database service is not configured or offline.');
    }

    try {
      const docRef = doc(firestore, 'users', userId, 'connections', providerId);
      await deleteDoc(docRef);
    } catch (e: any) {
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
      throw new DatabaseError('Database service is not configured or offline.');
    }

    try {
      const historyRef = collection(firestore, 'users', userId, 'connections', providerId, 'syncHistory');
      const q = query(historyRef, orderBy('timestamp', 'desc'), limit(20));
      const qSnap = await getDocs(q);
      const history: SyncAttempt[] = [];
      qSnap.forEach((docSnap) => {
        history.push(docSnap.data() as SyncAttempt);
      });
      return history;
    } catch (e: any) {
      console.error('Firestore getSyncHistory failed:', e);
      // We don't want to crash the UI for sync history errors, return empty list
      return [];
    }
  }

  /**
   * Log a new sync attempt.
   */
  static async saveSyncAttempt(userId: string, providerId: string, attempt: SyncAttempt): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      throw new DatabaseError('Database service is not configured or offline.');
    }

    try {
      const docRef = doc(firestore, 'users', userId, 'connections', providerId, 'syncHistory', attempt.id);
      await setDoc(docRef, attempt);
    } catch (e: any) {
      console.error('Firestore saveSyncAttempt failed:', e);
      throw new DatabaseError(e.message || 'Failed to save synchronization log.');
    }
  }
}
