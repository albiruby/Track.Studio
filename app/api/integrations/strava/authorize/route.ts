import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'Athlete User ID is required to initiate OAuth handshake.' },
      { status: 400 }
    );
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  if (!clientId) {
    return NextResponse.json(
      { error: 'Strava API is not configured on this server. Ensure STRAVA_CLIENT_ID is defined in environment variables.' },
      { status: 400 }
    );
  }

  const redirectUri = `${baseUrl}/api/integrations/strava/callback`;
  const authorizeUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=activity:read_all,profile:read&state=${encodeURIComponent(userId)}`;

  return NextResponse.redirect(authorizeUrl);
}
