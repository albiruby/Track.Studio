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

export class CanonicalRepository {
  /**
   * Persists a validated canonical athlete object under users/{userId}/canonical_athletes/athleteId
   */
  static async saveAthlete(athlete: CanonicalAthlete): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    const path = `users/${athlete.id}/canonical_athletes/${athlete.id}`;
    try {
      const docRef = doc(firestore, 'users', athlete.id, 'canonical_athletes', athlete.id);
      await setDoc(docRef, athlete);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  /**
   * Retrieves a specific Canonical Athlete.
   */
  static async getAthlete(userId: string, athleteId: string): Promise<CanonicalAthlete | null> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    const path = `users/${userId}/canonical_athletes/${athleteId}`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_athletes', athleteId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return snap.data() as CanonicalAthlete;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
    }
  }

  /**
   * Persists a validated canonical activity under users/{userId}/canonical_activities/activityId
   */
  static async saveActivity(activity: CanonicalActivity): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    const path = `users/${activity.athleteId}/canonical_activities/${activity.id}`;
    try {
      const docRef = doc(firestore, 'users', activity.athleteId, 'canonical_activities', activity.id);
      await setDoc(docRef, activity);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  /**
   * Retrieves a specific Canonical Activity.
   */
  static async getActivity(userId: string, activityId: string): Promise<CanonicalActivity | null> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    const path = `users/${userId}/canonical_activities/${activityId}`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_activities', activityId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return snap.data() as CanonicalActivity;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
    }
  }

  /**
   * Lists Canonical Activities for a user, ordered by startDate desc.
   */
  static async listActivities(userId: string, limitCount = 50): Promise<CanonicalActivity[]> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    const path = `users/${userId}/canonical_activities`;
    try {
      const colRef = collection(firestore, 'users', userId, 'canonical_activities');
      const q = query(colRef, orderBy('startDate', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      const activities: CanonicalActivity[] = [];
      snap.forEach((d) => activities.push(d.data() as CanonicalActivity));
      return activities;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }

  /**
   * Persists a validated canonical lap.
   */
  static async saveLap(lap: CanonicalLap, userId: string): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    const path = `users/${userId}/canonical_laps/${lap.id}`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_laps', lap.id);
      await setDoc(docRef, lap);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  /**
   * Lists Laps for a specific activity.
   */
  static async listLapsForActivity(userId: string, activityId: string): Promise<CanonicalLap[]> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    const path = `users/${userId}/canonical_laps`;
    try {
      const colRef = collection(firestore, 'users', userId, 'canonical_laps');
      const q = query(colRef, where('activityId', '==', activityId), orderBy('lapIndex', 'asc'));
      const snap = await getDocs(q);
      const laps: CanonicalLap[] = [];
      snap.forEach((d) => laps.push(d.data() as CanonicalLap));
      return laps;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }

  /**
   * Persists a canonical split. Splits are typically kept inside an array or separately.
   * If stored separately, we can store them under users/{userId}/canonical_splits/{activityId}_splitIndex
   */
  static async saveSplit(split: CanonicalSplit, userId: string): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    const id = `${split.activityId}_${split.splitType}_${split.splitIndex}`;
    const path = `users/${userId}/canonical_splits/${id}`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_splits', id);
      await setDoc(docRef, split);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  /**
   * Lists Splits for a specific activity and split type.
   */
  static async listSplitsForActivity(userId: string, activityId: string, splitType: 'kilometer' | 'mile'): Promise<CanonicalSplit[]> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

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
      snap.forEach((d) => splits.push(d.data() as CanonicalSplit));
      return splits;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }

  /**
   * Persists a validated canonical stream object.
   */
  static async saveStream(stream: CanonicalStream, userId: string): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    const path = `users/${userId}/canonical_streams/${stream.activityId}`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_streams', stream.activityId);
      await setDoc(docRef, stream);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  /**
   * Retrieves a specific Canonical Stream.
   */
  static async getStream(userId: string, activityId: string): Promise<CanonicalStream | null> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    const path = `users/${userId}/canonical_streams/${activityId}`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_streams', activityId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return snap.data() as CanonicalStream;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
    }
  }

  /**
   * Persists canonical gear.
   */
  static async saveGear(gear: CanonicalGear): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    const path = `users/${gear.athleteId}/canonical_gear/${gear.id}`;
    try {
      const docRef = doc(firestore, 'users', gear.athleteId, 'canonical_gear', gear.id);
      await setDoc(docRef, gear);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  /**
   * Retrieves a specific Canonical Gear item.
   */
  static async getGear(userId: string, gearId: string): Promise<CanonicalGear | null> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    const path = `users/${userId}/canonical_gear/${gearId}`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_gear', gearId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return snap.data() as CanonicalGear;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
    }
  }

  /**
   * Persists canonical routes.
   */
  static async saveRoute(route: CanonicalRoute): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    const path = `users/${route.athleteId}/canonical_routes/${route.id}`;
    try {
      const docRef = doc(firestore, 'users', route.athleteId, 'canonical_routes', route.id);
      await setDoc(docRef, route);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  /**
   * Persists schema or processing metadata separately.
   */
  static async saveMetadata(userId: string, metadata: CanonicalMetadata): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    const path = `users/${userId}/canonical_metadata/global`;
    try {
      const docRef = doc(firestore, 'users', userId, 'canonical_metadata', 'global');
      await setDoc(docRef, metadata);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }
}
