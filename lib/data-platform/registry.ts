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
    id: 'garmin-upload',
    name: 'Garmin FIT/GPX Upload',
    description: 'Upload Garmin activity files (.fit, .gpx) directly to parse and index GPS tracks, laps, and sensor streams.',
    logo: 'garmin',
    authType: 'FileUpload',
    supportedFeatures: [
      'Direct Fit File ingestion',
      'High-resolution streams extraction',
    ],
    supportedData: [
      'FIT/GPX files',
    ],
    capabilities: [
      'FIT_FILE_PARSING',
      'GPX_FILE_PARSING',
    ],
    version: 'v2',
    status: 'active',
  },
  {
    id: 'tcx-upload',
    name: 'TCX Upload',
    description: 'Upload Training Center XML (.tcx) files to ingest historical running activities with heart rate and lap definitions.',
    logo: 'tcx',
    authType: 'FileUpload',
    supportedFeatures: [
      'TCX parser with GPS tracks',
      'Heart rate and power intervals',
    ],
    supportedData: [
      'TCX files',
    ],
    capabilities: [
      'TCX_FILE_PARSING',
    ],
    version: 'v1',
    status: 'active',
  },
  {
    id: 'gpx-upload',
    name: 'GPX Upload',
    description: 'Upload standard GPS Exchange Format (.gpx) tracks to map routes, elevation profiles, and pacing variability.',
    logo: 'gpx',
    authType: 'FileUpload',
    supportedFeatures: [
      'GPX track rendering',
      'Elevation profiling & map matching',
    ],
    supportedData: [
      'GPX files',
    ],
    capabilities: [
      'GPX_TRACK_PARSING',
    ],
    version: 'v1',
    status: 'active',
  },
  {
    id: 'manual-entry',
    name: 'Manual Activity Entry',
    description: 'Log workouts manually with duration, distance, heart rate, and training load to keep records complete.',
    logo: 'manual',
    authType: 'Manual',
    supportedFeatures: [
      'Custom activity logger form',
      'Direct load estimation',
    ],
    supportedData: [
      'Manual forms',
    ],
    capabilities: [
      'MANUAL_FORM_SUBMISSION',
    ],
    version: 'v1',
    status: 'active',
  }
];

export function getProviderById(id: string): IntegrationProvider | undefined {
  return INTEGRATION_PROVIDERS.find(p => p.id === id);
}

