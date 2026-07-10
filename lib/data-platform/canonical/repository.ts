import { getFirebaseFirestore, getFirebaseAuth } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where
} from 'firebase/firestore';
import { 
  CanonicalAthlete, 
  CanonicalActivity, 
  CanonicalLap, 
  CanonicalSplit, 
  CanonicalStream, 
  CanonicalGear, 
  CanonicalRoute,
  CanonicalMetadata 
} from './types';
import { DatabaseError } from '@/lib/utils/errors';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const auth = getFirebaseAuth();
  const currentUser = auth?.currentUser;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
      tenantId: currentUser?.tenantId || null,
      providerInfo: currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  console.error('Firestore Canonical Repository Error: ', JSON.stringify(errInfo));
  throw new DatabaseError(JSON.stringify(errInfo));
}

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

class FallbackStorage {
  private static memoryDb: Record<string, any> = {};

  private static getStorageKey(collection: string, userId: string): string {
    return `trackstudio_fallback_${userId}_${collection}`;
  }

  static get<T>(collection: string, userId: string, id: string): T | null {
    const memKey = `${userId}:${collection}:${id}`;
    if (this.memoryDb[memKey] !== undefined) {
      return this.memoryDb[memKey];
    }

    try {
      if (typeof window !== 'undefined') {
        const key = this.getStorageKey(collection, userId);
        const dataStr = localStorage.getItem(key);
        if (dataStr) {
          const items = JSON.parse(dataStr);
          if (items && items[id]) {
            this.memoryDb[memKey] = items[id];
            return items[id] as T;
          }
        }
      }
    } catch (e) {
      console.warn('FallbackStorage: localStorage read failed', e);
    }
    return null;
  }

  static list<T>(collection: string, userId: string): T[] {
    const key = this.getStorageKey(collection, userId);
    const prefix = `${userId}:${collection}:`;
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
              const id = item.id || item.activityId || 'global';
              this.memoryDb[`${userId}:${collection}:${id}`] = item;
            });
            return list;
          }
        }
      }
    } catch (e) {
      console.warn('FallbackStorage: localStorage list failed', e);
    }
    return [];
  }

  static save<T>(collection: string, userId: string, id: string, data: T): void {
    const memKey = `${userId}:${collection}:${id}`;
    this.memoryDb[memKey] = data;

    try {
      if (typeof window !== 'undefined') {
        const key = this.getStorageKey(collection, userId);
        const dataStr = localStorage.getItem(key);
        const items = dataStr ? JSON.parse(dataStr) : {};
        items[id] = data;
        localStorage.setItem(key, JSON.stringify(items));
      }
    } catch (e) {
      console.warn('FallbackStorage: localStorage write failed', e);
    }
  }
}

export class CanonicalRepository {
  /**
   * Persists a validated canonical athlete object under users/{userId}/canonical_athletes/athleteId
   */
  static async saveAthlete(athlete: CanonicalAthlete): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      FallbackStorage.save('athletes', athlete.id, athlete.id, athlete);
      return;
    }

    const path = `users/${athlete.id}/canonical_athletes/${athlete.id}`;
    try {
      const docRef = doc(firestore, 'users', athlete.id, 'canonical_athletes', athlete.id);
      await setDoc(docRef, athlete);
      FallbackStorage.save('athletes', athlete.id, athlete.id, athlete);
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Saved athlete locally: ${athlete.id}`);
        FallbackStorage.save('athletes', athlete.id, athlete.id, athlete);
        return;
      }
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  /**
   * Retrieves a specific Canonical Athlete.
   */
  static async getAthlete(userId: string, athleteId: string): Promise<CanonicalAthlete | null> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      return FallbackStorage.get<CanonicalAthlete>('athletes', userId, athleteId);
    }

    const path = `users/${userId}/canonical_athletes/${athleteId}`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_athletes', athleteId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      const data = snap.data() as CanonicalAthlete;
      FallbackStorage.save('athletes', userId, athleteId, data);
      return data;
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Getting athlete from local fallback: ${athleteId}`);
        return FallbackStorage.get<CanonicalAthlete>('athletes', userId, athleteId);
      }
      handleFirestoreError(e, OperationType.GET, path);
    }
  }

  /**
   * Persists a validated canonical activity under users/{userId}/canonical_activities/activityId
   */
  static async saveActivity(activity: CanonicalActivity): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      FallbackStorage.save('activities', activity.athleteId, activity.id, activity);
      return;
    }

    const path = `users/${activity.athleteId}/canonical_activities/${activity.id}`;
    try {
      const docRef = doc(firestore, 'users', activity.athleteId, 'canonical_activities', activity.id);
      await setDoc(docRef, activity);
      FallbackStorage.save('activities', activity.athleteId, activity.id, activity);
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Saved activity locally: ${activity.id}`);
        FallbackStorage.save('activities', activity.athleteId, activity.id, activity);
        return;
      }
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  /**
   * Retrieves a specific Canonical Activity.
   */
  static async getActivity(userId: string, activityId: string): Promise<CanonicalActivity | null> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      return FallbackStorage.get<CanonicalActivity>('activities', userId, activityId);
    }

    const path = `users/${userId}/canonical_activities/${activityId}`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_activities', activityId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      const data = snap.data() as CanonicalActivity;
      FallbackStorage.save('activities', userId, activityId, data);
      return data;
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Getting activity from local fallback: ${activityId}`);
        return FallbackStorage.get<CanonicalActivity>('activities', userId, activityId);
      }
      handleFirestoreError(e, OperationType.GET, path);
    }
  }

  /**
   * Lists Canonical Activities for a user, ordered by startDate desc.
   */
  static async listActivities(userId: string, limitCount = 50): Promise<CanonicalActivity[]> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      return FallbackStorage.list<CanonicalActivity>('activities', userId)
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, limitCount);
    }

    const path = `users/${userId}/canonical_activities`;
    try {
      const colRef = collection(firestore, 'users', userId, 'canonical_activities');
      const q = query(colRef, orderBy('startDate', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      const activities: CanonicalActivity[] = [];
      snap.forEach((d) => {
        const act = d.data() as CanonicalActivity;
        activities.push(act);
        FallbackStorage.save('activities', userId, act.id, act);
      });
      return activities;
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Listing activities from local fallback.`);
        return FallbackStorage.list<CanonicalActivity>('activities', userId)
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, limitCount);
      }
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }

  /**
   * Persists a validated canonical lap.
   */
  static async saveLap(lap: CanonicalLap, userId: string): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      FallbackStorage.save('laps', userId, lap.id, lap);
      return;
    }

    const path = `users/${userId}/canonical_laps/${lap.id}`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_laps', lap.id);
      await setDoc(docRef, lap);
      FallbackStorage.save('laps', userId, lap.id, lap);
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Saved lap locally: ${lap.id}`);
        FallbackStorage.save('laps', userId, lap.id, lap);
        return;
      }
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  /**
   * Lists Laps for a specific activity.
   */
  static async listLapsForActivity(userId: string, activityId: string): Promise<CanonicalLap[]> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      return FallbackStorage.list<CanonicalLap>('laps', userId)
        .filter((l) => l.activityId === activityId)
        .sort((a, b) => a.lapIndex - b.lapIndex);
    }

    const path = `users/${userId}/canonical_laps`;
    try {
      const colRef = collection(firestore, 'users', userId, 'canonical_laps');
      const q = query(colRef, where('activityId', '==', activityId), orderBy('lapIndex', 'asc'));
      const snap = await getDocs(q);
      const laps: CanonicalLap[] = [];
      snap.forEach((d) => {
        const lap = d.data() as CanonicalLap;
        laps.push(lap);
        FallbackStorage.save('laps', userId, lap.id, lap);
      });
      return laps;
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Listing laps locally.`);
        return FallbackStorage.list<CanonicalLap>('laps', userId)
          .filter((l) => l.activityId === activityId)
          .sort((a, b) => a.lapIndex - b.lapIndex);
      }
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }

  /**
   * Persists a canonical split. Splits are typically kept inside an array or separately.
   * If stored separately, we can store them under users/{userId}/canonical_splits/{activityId}_splitIndex
   */
  static async saveSplit(split: CanonicalSplit, userId: string): Promise<void> {
    const firestore = getFirebaseFirestore();
    const id = `${split.activityId}_${split.splitType}_${split.splitIndex}`;
    if (!firestore) {
      FallbackStorage.save('splits', userId, id, split);
      return;
    }

    const path = `users/${userId}/canonical_splits/${id}`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_splits', id);
      await setDoc(docRef, split);
      FallbackStorage.save('splits', userId, id, split);
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Saved split locally: ${id}`);
        FallbackStorage.save('splits', userId, id, split);
        return;
      }
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  /**
   * Lists Splits for a specific activity and split type.
   */
  static async listSplitsForActivity(userId: string, activityId: string, splitType: 'kilometer' | 'mile'): Promise<CanonicalSplit[]> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      return FallbackStorage.list<CanonicalSplit>('splits', userId)
        .filter((s) => s.activityId === activityId && s.splitType === splitType)
        .sort((a, b) => a.splitIndex - b.splitIndex);
    }

    const path = `users/${userId}/canonical_splits`;
    try {
      const colRef = collection(firestore, 'users', userId, 'canonical_splits');
      const q = query(
        colRef, 
        where('activityId', '==', activityId), 
        where('splitType', '==', splitType),
        orderBy('splitIndex', 'asc')
      );
      const snap = await getDocs(q);
      const splits: CanonicalSplit[] = [];
      snap.forEach((d) => {
        const split = d.data() as CanonicalSplit;
        splits.push(split);
        const id = `${split.activityId}_${split.splitType}_${split.splitIndex}`;
        FallbackStorage.save('splits', userId, id, split);
      });
      return splits;
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Listing splits locally.`);
        return FallbackStorage.list<CanonicalSplit>('splits', userId)
          .filter((s) => s.activityId === activityId && s.splitType === splitType)
          .sort((a, b) => a.splitIndex - b.splitIndex);
      }
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }

  /**
   * Persists a validated canonical stream object.
   */
  static async saveStream(stream: CanonicalStream, userId: string): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      FallbackStorage.save('streams', userId, stream.activityId, stream);
      return;
    }

    const path = `users/${userId}/canonical_streams/${stream.activityId}`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_streams', stream.activityId);
      await setDoc(docRef, stream);
      FallbackStorage.save('streams', userId, stream.activityId, stream);
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Saved stream locally: ${stream.activityId}`);
        FallbackStorage.save('streams', userId, stream.activityId, stream);
        return;
      }
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  /**
   * Retrieves a specific Canonical Stream.
   */
  static async getStream(userId: string, activityId: string): Promise<CanonicalStream | null> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      return FallbackStorage.get<CanonicalStream>('streams', userId, activityId);
    }

    const path = `users/${userId}/canonical_streams/${activityId}`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_streams', activityId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      const data = snap.data() as CanonicalStream;
      FallbackStorage.save('streams', userId, activityId, data);
      return data;
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Getting stream locally: ${activityId}`);
        return FallbackStorage.get<CanonicalStream>('streams', userId, activityId);
      }
      handleFirestoreError(e, OperationType.GET, path);
    }
  }

  /**
   * Persists canonical gear.
   */
  static async saveGear(gear: CanonicalGear): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      FallbackStorage.save('gear', gear.athleteId, gear.id, gear);
      return;
    }

    const path = `users/${gear.athleteId}/canonical_gear/${gear.id}`;
    try {
      const docRef = doc(firestore, 'users', gear.athleteId, 'canonical_gear', gear.id);
      await setDoc(docRef, gear);
      FallbackStorage.save('gear', gear.athleteId, gear.id, gear);
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Saved gear locally: ${gear.id}`);
        FallbackStorage.save('gear', gear.athleteId, gear.id, gear);
        return;
      }
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  /**
   * Retrieves a specific Canonical Gear item.
   */
  static async getGear(userId: string, gearId: string): Promise<CanonicalGear | null> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      return FallbackStorage.get<CanonicalGear>('gear', userId, gearId);
    }

    const path = `users/${userId}/canonical_gear/${gearId}`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_gear', gearId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      const data = snap.data() as CanonicalGear;
      FallbackStorage.save('gear', userId, gearId, data);
      return data;
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Getting gear locally: ${gearId}`);
        return FallbackStorage.get<CanonicalGear>('gear', userId, gearId);
      }
      handleFirestoreError(e, OperationType.GET, path);
    }
  }

  /**
   * Persists canonical routes.
   */
  static async saveRoute(route: CanonicalRoute): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      FallbackStorage.save('routes', route.athleteId, route.id, route);
      return;
    }

    const path = `users/${route.athleteId}/canonical_routes/${route.id}`;
    try {
      const docRef = doc(firestore, 'users', route.athleteId, 'canonical_routes', route.id);
      await setDoc(docRef, route);
      FallbackStorage.save('routes', route.athleteId, route.id, route);
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Saved route locally: ${route.id}`);
        FallbackStorage.save('routes', route.athleteId, route.id, route);
        return;
      }
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  /**
   * Persists schema or processing metadata separately.
   */
  static async saveMetadata(userId: string, metadata: CanonicalMetadata): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) {
      FallbackStorage.save('metadata', userId, 'global', metadata);
      return;
    }

    const path = `users/${userId}/canonical_metadata/global`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_metadata', 'global');
      await setDoc(docRef, metadata);
      FallbackStorage.save('metadata', userId, 'global', metadata);
    } catch (e) {
      if (isOfflineError(e)) {
        console.warn(`Firestore offline. Saved metadata locally.`);
        FallbackStorage.save('metadata', userId, 'global', metadata);
        return;
      }
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }
}
