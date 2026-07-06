import { IntegrationProvider } from './types';

export const INTEGRATION_PROVIDERS: IntegrationProvider[] = [
  {
    id: 'strava',
    name: 'Strava',
    description: 'Connect to Strava to import GPS tracks, elevation data, heart rate streams, and power logs from runs.',
    logo: 'strava',
    authType: 'OAuth2',
    supportedFeatures: [
      'Ingest Runs',
      'Ingest GPS Coordinates & GPX streams',
      'Extract HR, Cadence, and Power datasets',
    ],
    supportedData: [
      'Running Activities',
      'Sensor Streams (Pace, HR, Power, Grade)',
    ],
    capabilities: [
      'REAL_TIME_WEBHOOK_INGESTION',
      'HISTORICAL_BACKFILL_30_DAYS',
      'ATHLETE_PROFILE_SYNC',
    ],
    version: 'v3',
    status: 'active',
  },
  {
    id: 'intervals-icu',
    name: 'Intervals.icu',
    description: 'Sync advanced physiology parameters, fitness charts (CTL/ATL/TSB), training loads, and HRV trends.',
    logo: 'intervals',
    authType: 'APIKey',
    supportedFeatures: [
      'Ingest Daily Metrics',
      'Sync Physiological Benchmarks (VO2Max, FTP)',
      'Ingest Heart Rate Variability (HRV) streams',
    ],
    supportedData: [
      'CTL / ATL / TSB performance metrics',
      'HRV & Sleep Quality indexes',
      'Planned Workouts & Threshold Zone charts',
    ],
    capabilities: [
      'MANUAL_FETCH',
      'REST_API_JSON_SYNC',
      'HISTORICAL_BACKFILL_365_DAYS',
    ],
    version: 'v1',
    status: 'active',
  },
  {
    id: 'garmin-connect',
    name: 'Garmin Connect',
    description: 'Direct ingestion from your Garmin sports watch. Sync body battery, sleep tracking, and run statistics.',
    logo: 'garmin',
    authType: 'OAuth2',
    supportedFeatures: [
      'Direct Fit File ingestion',
      'Sync Sleep & Recovery Metrics',
    ],
    supportedData: [
      'Activities',
      'Sleep Score & HRV Status',
    ],
    capabilities: [
      'REAL_TIME_PULL',
      'FIT_FILE_PARSING',
    ],
    version: 'v2',
    status: 'beta',
  },
  {
    id: 'coros',
    name: 'Coros Developer Portal',
    description: 'Synchronize running dynamics, stride length, vertical oscillation, and ground contact balance from Coros watches.',
    logo: 'coros',
    authType: 'OAuth2',
    supportedFeatures: [
      'Sync Activity summaries',
      'Running Dynamics analysis',
    ],
    supportedData: [
      'Activities',
      'Stride metrics',
    ],
    capabilities: [
      'WEBHOOK_INGESTION',
    ],
    version: 'v1',
    status: 'maintenance',
  },
  {
    id: 'wahoo',
    name: 'Wahoo Cloud API',
    description: 'Import workout files from Wahoo ELEMNT RIVAL watches and structured sensor streams.',
    logo: 'wahoo',
    authType: 'OAuth2',
    supportedFeatures: [
      'Sync Run Workouts',
    ],
    supportedData: [
      'Activities',
    ],
    capabilities: [
      'PULL_ON_DEMAND',
    ],
    version: 'v2',
    status: 'beta',
  }
];

export function getProviderById(id: string): IntegrationProvider | undefined {
  return INTEGRATION_PROVIDERS.find(p => p.id === id);
}
