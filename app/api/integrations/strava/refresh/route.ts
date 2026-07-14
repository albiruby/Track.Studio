export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { ConnectionRepository } from '@/lib/data-platform/repository';
import { IngestionRepository } from '@/lib/data-platform/ingestion/repository';
import { Connection } from '@/lib/data-platform/types';
import { environment, assertStravaConfigured } from '@/lib/config/environment';

export async function POST(req: NextRequest) {
  try {
    const { connection } = await req.json();

    if (!connection || !connection.userId) {
      return NextResponse.json(
        { error: 'Invalid payload: connection details with userId are required.' },
        { status: 400 }
      );
    }

    const userId = connection.userId;

    try {
      assertStravaConfigured();
    } catch (err: any) {
      return NextResponse.json(
        { error: `Strava credentials are not configured on the server: ${err.message}` },
        { status: 500 }
      );
    }

    const clientId = environment.strava.clientId;
    const clientSecret = environment.strava.clientSecret;

    // Retrieve raw secure credentials from secure backend storage
    const secureCreds = await IngestionRepository.getSecureCredentials(userId, 'strava');
    if (!secureCreds || !secureCreds.refreshToken) {
      return NextResponse.json(
        { error: 'No secure refresh token was found for this connection. Re-authentication required.' },
        { status: 404 }
      );
    }

    // Exchange refresh token for fresh access token
    const refreshResponse = await fetch(`${environment.strava.oauthUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: secureCreds.refreshToken,
      }),
    });

    if (!refreshResponse.ok) {
      const errText = await refreshResponse.text();
      console.error('Strava token refresh endpoint failure:', errText);
      return NextResponse.json(
        { error: 'Failed to refresh token with Strava API server.' },
        { status: 401 }
      );
    }

    const refreshData = await refreshResponse.json();
    const { access_token, refresh_token: new_refresh_token, expires_at } = refreshData;

    // Build the updated connection object
    const updatedConnection: Connection = {
      ...connection,
      updatedAt: new Date().toISOString(),
      health: 'healthy',
      healthMessage: 'OAuth token refreshed on demand. Session active.',
      status: 'connected',
      metadata: {
        ...connection.metadata,
        expiresAt: new Date(expires_at * 1000).toISOString(),
        refreshTokenRedacted: '••••••••' + (new_refresh_token || secureCreds.refreshToken).slice(-4),
        accessTokenRedacted: '••••••••' + access_token.slice(-4),
      },
    };

    // Persist connection state changes
    await ConnectionRepository.saveConnection(updatedConnection);

    // Persist new credentials in secure backend storage
    await IngestionRepository.saveSecureCredentials(userId, 'strava', {
      accessToken: access_token,
      refreshToken: new_refresh_token || secureCreds.refreshToken,
      expiresAt: new Date(expires_at * 1000).toISOString(),
    });

    return NextResponse.json(updatedConnection);
  } catch (e: any) {
    console.error('Strava token refresh API route failure:', e);
    return NextResponse.json(
      { error: e.message || 'Token refresh execution failed.' },
      { status: 500 }
    );
  }
}
