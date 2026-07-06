export type SyncStatus =
  | 'queued'
  | 'running'
  | 'paused'
  | 'waiting'
  | 'retrying'
  | 'completed'
  | 'completed_with_warnings'
  | 'cancelled'
  | 'failed'
  | 'expired';

export interface SyncJob {
  id: string; // Job UUID
  providerId: string; // 'strava' | 'intervals-icu'
  userId: string; // internal Athlete UUID
  status: SyncStatus;
  startedAt: string; // ISO DateTime
  completedAt: string | null; // ISO DateTime
  progress: number; // 0 to 100
  currentPage: number;
  itemsProcessed: number;
  itemsImported: number;
  itemsFailed: number;
  retryCount: number;
  durationMs: number;
  lastError: string | null;
  cancellationState: 'none' | 'requested' | 'confirmed';
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface IngestionErrorRecord {
  id: string;
  category: 'authentication' | 'connection' | 'network' | 'rate_limited' | 'invalid_response' | 'pagination_failure' | 'validation_failure' | 'persistence_failure' | 'provider_error' | 'unexpected';
  severity: ErrorSeverity;
  source: string; // e.g. API client, deduplicator
  timestamp: string; // ISO DateTime
  providerId: string;
  userId: string;
  syncJobId: string;
  message: string;
  suggestedResolution: string;
  details?: Record<string, any>;
}

export interface RawDataRecord {
  id: string; // e.g., hash or uuid
  userId: string;
  syncJobId: string;
  providerId: string; // 'strava' | 'intervals-icu'
  dataType: 'athlete' | 'activities' | 'laps' | 'streams' | 'wellness' | 'events';
  receivedTimestamp: string; // ISO DateTime
  providerVersion: string;
  requestMetadata: {
    endpoint: string;
    params?: Record<string, any>;
    headersRedacted?: string[];
  };
  responseMetadata: {
    statusCode: number;
    headersRedacted?: Record<string, string>;
  };
  payloadHash: string;
  sourceEndpoint: string;
  payload: any; // ORIGINAL, UNMUTATED JSON payload from provider
}

export interface AuditLogRecord {
  id: string;
  userId: string;
  providerId: string;
  syncJobId: string;
  initiatedBy: 'user' | 'system' | 'webhook';
  timestamp: string; // ISO DateTime
  durationMs: number;
  itemsDownloaded: number;
  itemsStored: number;
  itemsSkipped: number;
  itemsFailed: number;
  warnings: string[];
  errors: string[];
  apiVersion: string;
  requestWindow: {
    start: string | null;
    end: string | null;
  };
  completionState: SyncStatus;
}
