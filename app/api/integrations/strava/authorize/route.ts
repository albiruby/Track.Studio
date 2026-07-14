export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { environment, assertStravaConfigured } from '@/lib/config/environment';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'Athlete User ID is required to initiate OAuth handshake.' },
      { status: 400 }
    );
  }

  try {
    assertStravaConfigured();
  } catch (err: any) {
    return NextResponse.json(
      { error: `Strava API is not configured on this server. Ensure STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, and STRAVA_REDIRECT_URI are defined in environment variables. Error: ${err.message}` },
      { status: 400 }
    );
  }

  const clientId = environment.strava.clientId;
  const redirectUri = environment.strava.redirectUri;
  
  const authorizeUrl = `${environment.strava.oauthUrl}/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri!
  )}&response_type=code&scope=activity:read_all,profile:read&state=${encodeURIComponent(userId)}`;

  return NextResponse.redirect(authorizeUrl);
}
