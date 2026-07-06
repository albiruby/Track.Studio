import { 
  Timestamp, 
  DocumentData, 
  QueryDocumentSnapshot, 
  FirestoreDataConverter,
  writeBatch,
  runTransaction,
  Transaction,
  collection,
  doc
} from 'firebase/firestore';
import { db } from '../client';
import { handleFirestoreError, OperationType } from '../../firebase-error';

/**
 * Reusable Firestore Data Converter for ensuring strict type-safety
 */
export function createConverter<T extends object>(): FirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: T): DocumentData {
      return modelObject;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
      } as unknown as T;
    },
  };
}

/**
 * Converts Firestore Timestamps to ISO 8601 string representations
 */
export function timestampToIsoString(timestamp: unknown): string {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp && 'nanoseconds' in timestamp) {
    const t = timestamp as { seconds: number; nanoseconds: number };
    return new Timestamp(t.seconds, t.nanoseconds).toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return new Date().toISOString();
}

/**
 * Converts ISO string representations to Firestore Timestamps
 */
export function isoStringToTimestamp(isoString: string): Timestamp {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return Timestamp.now();
    }
    return Timestamp.fromDate(date);
  } catch {
    return Timestamp.now();
  }
}

/**
 * Appends standard metadata properties to an entity write payload
 */
export function withBaseMetadata<T extends object>(
  data: T,
  isUpdate = false
): T & { createdAt?: string; updatedAt: string } {
  const nowStr = new Date().toISOString();
  if (isUpdate) {
    return {
      ...data,
      updatedAt: nowStr,
    };
  }
  return {
    ...data,
    createdAt: nowStr,
    updatedAt: nowStr,
  };
}

/**
 * Standard utility to split large sets of document writes into batches of max 500 records
 */
export async function executeInBatches<T extends { id: string }>(
  collectionPath: string,
  items: T[],
  operation: 'set' | 'delete'
): Promise<void> {
  const LIMIT = 450; // Use 450 to be safe from Firestore 500 writes limit
  let batch = writeBatch(db);
  let operationCount = 0;

  try {
    for (const item of items) {
      const docRef = doc(collection(db, collectionPath), item.id);
      
      if (operation === 'set') {
        batch.set(docRef, item);
      } else if (operation === 'delete') {
        batch.delete(docRef);
      }
      
      operationCount++;

      if (operationCount >= LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}

/**
 * Standard transaction helper which logs and formats permission errors
 */
export async function runSafeTransaction<T>(
  updateFunction: (transaction: Transaction) => Promise<T>,
  pathContext: string | null = null
): Promise<T> {
  try {
    return await runTransaction(db, updateFunction);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathContext);
  }
}
