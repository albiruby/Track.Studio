export type ConnectionStatus = 
  | 'connected' 
  | 'disconnected' 
  | 'expired' 
  | 'syncing' 
  | 'error' 
  | 'maintenance' 
  | 'unauthorized';

export type ConnectionHealth = 
  | 'healthy' 
  | 'warning' 
  | 'critical' 
  | 'offline' 
  | 'unknown';

export type AuthenticationType = 
  | 'OAuth2' 
  | 'APIKey' 
  | 'BearerToken' 
  | 'BasicAuth' 
  | 'NoAuth';

export interface IntegrationProvider {
  id: string; // e.g. 'strava', 'intervals-icu'
  name: string; // e.g. 'Strava Free API'
  description: string;
  logo: string; // icon name or illustrative URL
  authType: AuthenticationType;
  supportedFeatures: string[]; // e.g. ['Ingest Activities', 'Calculate Heart Rate Zones']
  supportedData: string[]; // e.g. ['Activities', 'Power Curves', 'Sleep Data']
  capabilities: string[]; // e.g. ['REAL_TIME_WEBHOOK', 'HISTORICAL_BACKFILL']
  version: string; // API Version
  status: 'active' | 'beta' | 'maintenance' | 'deprecated';
}

export interface Connection {
  id: string; // unique database connection id (e.g., userUid_providerId)
  userId: string; // internal Track.Studio Athlete UUID
  providerId: string; // e.g. 'strava'
  externalUserId: string | null; // e.g. athlete ID in external system
  accountName: string | null; // e.g. "Alex Mercer"
  connectedAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
  lastSyncAt: string | null; // ISO DateTime of last sync
  status: ConnectionStatus;
  scopes: string[]; // authorized permissions
  health: ConnectionHealth;
  healthMessage: string | null;
  metadata: Record<string, any>; // custom vendor-specific parameters
}

export interface SyncAttempt {
  id: string;
  connectionId: string;
  timestamp: string;
  status: 'success' | 'failed' | 'in_progress';
  recordsSynced: number;
  errorLog: string | null;
  durationMs: number;
}
