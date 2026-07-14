export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { ConnectionRepository } from '@/lib/data-platform/repository';
import { Connection } from '@/lib/data-platform/types';
import { environment, assertStravaConfigured } from '@/lib/config/environment';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state'); // Passed back as state
  const error = searchParams.get('error');

  const baseUrl = environment.app.url;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/?error=${encodeURIComponent(error)}`);
  }

  if (!code || !userId) {
    return NextResponse.redirect(`${baseUrl}/?error=Missing+code+or+state`);
  }

  try {
    assertStravaConfigured();
  } catch (err: any) {
    return NextResponse.redirect(`${baseUrl}/?error=Strava+credentials+missing+on+server`);
  }

  const clientId = environment.strava.clientId;
  const clientSecret = environment.strava.clientSecret;

  try {
    // Exchange token
    const tokenResponse = await fetch(`${environment.strava.oauthUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error('Strava token exchange failure:', errBody);
      return NextResponse.redirect(`${baseUrl}/?error=Token+exchange+failed`);
    }

    const authData = await tokenResponse.json();
    const { access_token, refresh_token, expires_at, athlete } = authData;

    const externalUserId = athlete?.id ? String(athlete.id) : 'unknown_athlete';
    const athleteName = [athlete?.firstname, athlete?.lastname].filter(Boolean).join(' ') || 'Authorized Runner';

    const connection: Connection = {
      id: `${userId}_strava`,
      userId,
      providerId: 'strava',
      externalUserId,
      accountName: `${athleteName} (Strava)`,
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSyncAt: null,
      status: 'connected',
      scopes: ['activity:read_all', 'profile:read'],
      health: 'healthy',
      healthMessage: 'Access token validated. Connection active.',
      metadata: {
        athleteId: externalUserId,
        expiresAt: new Date(expires_at * 1000).toISOString(),
        refreshTokenRedacted: '••••••••' + refresh_token.slice(-4),
        accessTokenRedacted: '••••••••' + access_token.slice(-4),
      },
    };

    // Save connection to production Firestore repository
    await ConnectionRepository.saveConnection(connection);

    // Save the actual raw tokens in secure backend storage
    const { IngestionRepository } = await import('@/lib/data-platform/ingestion/repository');
    await IngestionRepository.saveSecureCredentials(userId, 'strava', {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(expires_at * 1000).toISOString(),
    });

    return NextResponse.redirect(`${baseUrl}/?success=strava_connected`);
  } catch (err: any) {
    console.error('Strava OAuth callback error:', err);
    return NextResponse.redirect(`${baseUrl}/?error=${encodeURIComponent(err.message || 'OAuth failure')}`);
  }
}
