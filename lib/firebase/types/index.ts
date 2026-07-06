import { User as FirebaseUser } from 'firebase/auth';

/**
 * Base metadata appended to all Firestore documents
 */
export interface BaseMetadata {
  createdAt: string; // ISO String or Server Timestamp representation
  updatedAt: string; // ISO String or Server Timestamp representation
}

/**
 * Interface representing a base entity stored in Firestore
 */
export interface BaseEntity extends BaseMetadata {
  id: string;
}

/**
 * Reusable user model mapped from Firebase Auth
 */
export interface UserProfile extends BaseEntity {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  phoneNumber: string | null;
  lastLoginAt: string;
}

/**
 * Active session tracking state
 */
export interface SessionState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

/**
 * Reusable Paginated queries options
 */
export interface PaginationOptions {
  limit?: number;
  startAfterId?: string;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Mapped response for paginated collections
 */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  lastDocId: string | null;
}

/**
 * Standard Result envelope pattern for error isolation
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Mapped error codes for Firebase operations
 */
export enum FirebaseErrorCode {
  UNAUTHENTICATED = 'unauthenticated',
  PERMISSION_DENIED = 'permission-denied',
  NOT_FOUND = 'not-found',
  ALREADY_EXISTS = 'already-exists',
  INVALID_ARGUMENT = 'invalid-argument',
  FAILED_PRECONDITION = 'failed-precondition',
  ABORTED = 'aborted',
  OUT_OF_RANGE = 'out-of-range',
  INTERNAL = 'internal',
  UNAVAILABLE = 'unavailable',
  DATA_LOSS = 'data-loss',
  UNKNOWN = 'unknown',
}

/**
 * Firestore operation classifications matching rule definitions
 */
export enum FirestoreOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
