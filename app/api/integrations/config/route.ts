export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { environment } from '@/lib/config/environment';

export async function GET() {
  // Determine the status of Strava
  let stravaStatus: 'Ready' | 'Missing Secret' | 'Invalid Redirect URI' = 'Ready';
  if (!environment.strava.clientId || !environment.strava.clientSecret) {
    stravaStatus = 'Missing Secret';
  } else if (!environment.strava.redirectUri || !environment.strava.redirectUri.includes('/api/integrations/strava/callback')) {
    stravaStatus = 'Invalid Redirect URI';
  }

  // Determine the status of Intervals
  let intervalsStatus: 'Ready' | 'Missing API Key' = 'Ready';
  if (!environment.intervals.athleteId || !environment.intervals.apiKey) {
    intervalsStatus = 'Missing API Key';
  }

  return NextResponse.json({
    success: true,
    strava: {
      status: stravaStatus,
      authType: 'OAuth2',
      version: 'v3',
    },
    'intervals-icu': {
      status: intervalsStatus,
      authType: 'APIKey',
      version: 'v1',
    },
    'garmin-upload': {
      status: 'Ready',
      authType: 'FileUpload',
      version: 'v2',
    },
    'tcx-upload': {
      status: 'Ready',
      authType: 'FileUpload',
      version: 'v1',
    },
    'gpx-upload': {
      status: 'Ready',
      authType: 'FileUpload',
      version: 'v1',
    },
    'manual-entry': {
      status: 'Ready',
      authType: 'Manual',
      version: 'v1',
    },
  });
}
