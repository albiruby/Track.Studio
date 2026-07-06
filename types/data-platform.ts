/**
 * Data Platform Types - Track.Studio
 * Handles OAuth, Connections, Synchronization, and Canonical Running Data models.
 */

export type ConnectionSource = 'strava' | 'intervals_icu' | 'manual';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface OAuthCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in seconds
  scope: string[];
}

export interface IntervalsIcuCredentials {
  athleteId: string;
  readKey: string;
}

export interface UserConnection {
  id: string;
  userId: string;
  source: ConnectionSource;
  connectedAt: Date;
  lastSyncedAt: Date | null;
  syncStatus: SyncStatus;
  errorMessage: string | null;
  // Dynamic credentials depending on the source
  credentials?: {
    oauth?: OAuthCredentials;
    intervals?: IntervalsIcuCredentials;
  };
}

/**
 * Running Sport Type taxonomy
 */
export type RunningSportType = 'Run' | 'TrailRun' | 'Treadmill';

/**
 * Time-series high-frequency data streams.
 * Crucial for professional deterministic running performance analysis.
 */
export interface MetricStreams {
  time: number[];       // Time elapsed since start (seconds)
  distance?: number[];  // Distance covered (meters)
  heartrate?: number[]; // Heart rate (beats per minute)
  cadence?: number[];   // Cadence (steps per minute)
  altitude?: number[];  // Altitude (meters)
  velocity?: number[];  // Running speed (meters per second)
  grade?: number[];     // Grade percentage (calculated or raw)
}

/**
 * NormalizedActivity
 * The Canonical Data Model. The Single Source of Truth.
 * Adheres strictly to the:
 * - Real data only
 * - Preservation of raw details
 * - Deterministic calculations
 */
export interface NormalizedActivity {
  id: string;               // Canonical run ID: TS-[userId]-[source]-[sourceActivityId]
  userId: string;           // Track.Studio Owner ID
  source: ConnectionSource;
  sourceActivityId: string; // ID from external source
  title: string;
  sportType: RunningSportType;
  startDate: string;        // ISO 8601 string in local time
  utcStartDate: string;     // ISO 8601 string in UTC
  timezone: string;         // e.g. "Europe/Paris"
  
  // Base physical metrics (Real raw / verified only)
  distance: number;         // in meters
  movingTime: number;       // in seconds
  elapsedTime: number;      // in seconds
  
  // Speed metrics
  averageSpeed: number;     // in meters/second
  maxSpeed: number;         // in meters/second
  
  // Heart rate metrics
  averageHeartrate: number | null; // in bpm
  maxHeartrate: number | null;     // in bpm
  
  // Cadence metrics
  averageCadence: number | null;   // in spm (steps per minute, or RPM * 2)
  
  // Elevation metrics
  totalElevationGain: number;      // in meters
  totalElevationLoss: number;      // in meters
  
  // Flag indicating if complete high-frequency stream is connected/cached
  hasStreams: boolean;
  streams?: MetricStreams;         // Time series stream
  
  createdAt: string;               // Database ingestion time
  updatedAt: string;               // Database last modification time
}
