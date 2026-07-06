import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../client';
import { handleFirestoreError, OperationType } from '../../firebase-error';
import { createConverter, withBaseMetadata } from '../utils';
import { BaseEntity, PaginationOptions, PaginatedResult } from '../types';

/**
 * Reusable abstract base repository to enforce strict schemas, type safety, 
 * zero-trust document boundaries, and automated error wrapping.
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected collectionPath: string;
  protected converter = createConverter<T>();

  constructor(collectionPath: string) {
    this.collectionPath = collectionPath;
  }

  /**
   * Reference to the Firestore collection
   */
  protected getCollectionRef() {
    return collection(db, this.collectionPath).withConverter(this.converter);
  }

  /**
   * Reference to a specific Firestore document
   */
  protected getDocRef(id: string) {
    return doc(db, this.collectionPath, id).withConverter(this.converter);
  }

  /**
   * Get a single document by its unique ID
   */
  async get(id: string): Promise<T | null> {
    try {
      const docRef = this.getDocRef(id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        return null;
      }
      return snapshot.data() || null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${this.collectionPath}/${id}`);
    }
  }

  /**
   * Create a new document with an explicit ID and auto-appended timestamps
   */
  async create(id: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const docRef = this.getDocRef(id);
      const payload = withBaseMetadata({ ...data, id } as unknown as T, false);
      
      await setDoc(docRef, payload);
      return payload;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${this.collectionPath}/${id}`);
    }
  }

  /**
   * Updates a document partially, strictly refreshing the `updatedAt` field
   */
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const docRef = this.getDocRef(id);
      const payload = withBaseMetadata(data, true);
      
      await updateDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${this.collectionPath}/${id}`);
    }
  }

  /**
   * Hard delete a document by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = this.getDocRef(id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${this.collectionPath}/${id}`);
    }
  }

  /**
   * Fetch all documents from this collection matching explicit filters
   */
  async findByField(field: keyof T, value: any): Promise<T[]> {
    try {
      const colRef = this.getCollectionRef();
      const q = query(colRef, where(field as string, '==', value));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((d) => d.data());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.collectionPath);
    }
  }

  /**
   * Base paginated list query with support for sorting and continuation tokens
   */
  async list(options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
    const {
      limit: pageLimit = 20,
      startAfterId,
      orderByField = 'createdAt',
      orderDirection = 'desc',
    } = options;

    try {
      const colRef = this.getCollectionRef();
      const constraints: QueryConstraint[] = [];

      // Add order constraints
      constraints.push(orderBy(orderByField, orderDirection));

      // Handle pagination start cursor
      if (startAfterId) {
        const startAfterDocRef = doc(db, this.collectionPath, startAfterId);
        const startAfterSnapshot = await getDoc(startAfterDocRef);
        if (startAfterSnapshot.exists()) {
          constraints.push(startAfter(startAfterSnapshot));
        }
      }

      // Add limit (+1 to check if there is a next page)
      constraints.push(limit(pageLimit + 1));

      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);
      
      const docs = snapshot.docs;
      const hasMore = docs.length > pageLimit;
      const resultDocs = hasMore ? docs.slice(0, pageLimit) : docs;
      
      const items = resultDocs.map((d) => d.data());
      const lastDocId = resultDocs.length > 0 ? resultDocs[resultDocs.length - 1].id : null;

      return {
        items,
        totalCount: items.length, // local size of result
        hasMore,
        lastDocId,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.collectionPath);
    }
  }
}
