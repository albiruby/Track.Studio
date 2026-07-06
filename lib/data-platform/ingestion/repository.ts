import { getFirebaseFirestore } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { SyncJob, RawDataRecord, IngestionErrorRecord, AuditLogRecord } from './types';
import { DatabaseError } from '@/lib/utils/errors';

export class IngestionRepository {
  /**
   * Saves or updates a Sync Job in Firestore.
   */
  static async saveSyncJob(job: SyncJob): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    try {
      const docRef = doc(firestore, 'users', job.userId, 'syncJobs', job.id);
      await setDoc(docRef, job);
    } catch (e: any) {
      console.error('saveSyncJob Firestore error:', e);
      throw new DatabaseError(e.message || 'Failed to save sync job state.');
    }
  }

  /**
   * Retrieves a specific Sync Job.
   */
  static async getSyncJob(userId: string, jobId: string): Promise<SyncJob | null> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    try {
      const docRef = doc(firestore, 'users', userId, 'syncJobs', jobId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return snap.data() as SyncJob;
    } catch (e: any) {
      console.error('getSyncJob Firestore error:', e);
      throw new DatabaseError(e.message || 'Failed to retrieve sync job.');
    }
  }

  /**
   * List sync jobs for a user, ordered by startedAt desc.
   */
  static async listSyncJobs(userId: string, limitCount = 20): Promise<SyncJob[]> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    try {
      const colRef = collection(firestore, 'users', userId, 'syncJobs');
      const q = query(colRef, orderBy('startedAt', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      const jobs: SyncJob[] = [];
      snap.forEach((d) => jobs.push(d.data() as SyncJob));
      return jobs;
    } catch (e: any) {
      console.error('listSyncJobs Firestore error:', e);
      throw new DatabaseError(e.message || 'Failed to list sync jobs.');
    }
  }

  /**
   * Saves an unmutated raw data record to Firestore under users/{userId}/rawData/{recordId}.
   */
  static async saveRawData(record: RawDataRecord): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    try {
      const docRef = doc(firestore, 'users', record.userId, 'rawData', record.id);
      await setDoc(docRef, record);
    } catch (e: any) {
      console.error('saveRawData Firestore error:', e);
      throw new DatabaseError(e.message || 'Failed to save raw immutable response payload.');
    }
  }

  /**
   * Checks if a raw data record with the given payloadHash already exists for this user and provider.
   */
  static async isPayloadHashDuplicate(userId: string, providerId: string, payloadHash: string): Promise<boolean> {
    const firestore = getFirebaseFirestore();
    if (!firestore) return false;

    try {
      const colRef = collection(firestore, 'users', userId, 'rawData');
      const q = query(
        colRef, 
        where('providerId', '==', providerId),
        where('payloadHash', '==', payloadHash),
        limit(1)
      );
      const snap = await getDocs(q);
      return !snap.empty;
    } catch (e) {
      console.error('isPayloadHashDuplicate Firestore check failed:', e);
      return false; // Safely default to false on network failures
    }
  }

  /**
   * Checks if an external object ID (e.g., Strava Activity ID) has already been saved.
   */
  static async isExternalIdDuplicate(userId: string, providerId: string, externalId: string): Promise<boolean> {
    const firestore = getFirebaseFirestore();
    if (!firestore) return false;

    try {
      const colRef = collection(firestore, 'users', userId, 'rawData');
      const q = query(
        colRef,
        where('providerId', '==', providerId),
        where('sourceEndpoint', '==', externalId), // we store external IDs in sourceEndpoint or a query property
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) return true;

      // Also check if any raw document contains this ID in its payload key
      // But for Firestore efficiency, doing field query is much cleaner.
      // Therefore we can save metadata.externalId inside the requestMetadata or flat properties.
      return false;
    } catch (e) {
      console.error('isExternalIdDuplicate Firestore check failed:', e);
      return false;
    }
  }

  /**
   * Saves an Ingestion Error Record.
   */
  static async saveIngestionError(errRecord: IngestionErrorRecord): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) return;

    try {
      const docRef = doc(firestore, 'users', errRecord.userId, 'ingestionErrors', errRecord.id);
      await setDoc(docRef, errRecord);
    } catch (e) {
      console.error('saveIngestionError Firestore error:', e);
    }
  }

  /**
   * Lists the ingestion error records.
   */
  static async listIngestionErrors(userId: string, limitCount = 20): Promise<IngestionErrorRecord[]> {
    const firestore = getFirebaseFirestore();
    if (!firestore) return [];

    try {
      const colRef = collection(firestore, 'users', userId, 'ingestionErrors');
      const q = query(colRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      const errors: IngestionErrorRecord[] = [];
      snap.forEach((d) => errors.push(d.data() as IngestionErrorRecord));
      return errors;
    } catch (e) {
      console.error('listIngestionErrors Firestore error:', e);
      return [];
    }
  }

  /**
   * Saves an Audit Log Record.
   */
  static async saveAuditLog(log: AuditLogRecord): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) return;

    try {
      const docRef = doc(firestore, 'users', log.userId, 'auditLogs', log.id);
      await setDoc(docRef, log);
    } catch (e) {
      console.error('saveAuditLog Firestore error:', e);
    }
  }

  /**
   * Lists audit logs.
   */
  static async listAuditLogs(userId: string, limitCount = 20): Promise<AuditLogRecord[]> {
    const firestore = getFirebaseFirestore();
    if (!firestore) return [];

    try {
      const colRef = collection(firestore, 'users', userId, 'auditLogs');
      const q = query(colRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      const logs: AuditLogRecord[] = [];
      snap.forEach((d) => logs.push(d.data() as AuditLogRecord));
      return logs;
    } catch (e) {
      console.error('listAuditLogs Firestore error:', e);
      return [];
    }
  }

  /**
   * Saves sensitive connection credentials securely (server-only access).
   */
  static async saveSecureCredentials(userId: string, providerId: string, credentials: Record<string, any>): Promise<void> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    try {
      const docRef = doc(firestore, 'users', userId, 'connections_secure', providerId);
      await setDoc(docRef, {
        providerId,
        userId,
        credentials,
        updatedAt: new Date().toISOString()
      });
    } catch (e: any) {
      console.error('saveSecureCredentials error:', e);
      throw new DatabaseError('Failed to securely save credentials.');
    }
  }

  /**
   * Retrieves sensitive connection credentials (server-only access).
   */
  static async getSecureCredentials(userId: string, providerId: string): Promise<Record<string, any> | null> {
    const firestore = getFirebaseFirestore();
    if (!firestore) throw new DatabaseError('Database service is offline.');

    try {
      const docRef = doc(firestore, 'users', userId, 'connections_secure', providerId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return snap.data().credentials || null;
    } catch (e: any) {
      console.error('getSecureCredentials error:', e);
      return null;
    }
  }
}
