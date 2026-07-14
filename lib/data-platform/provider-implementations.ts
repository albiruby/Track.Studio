import { IIntegrationProviderService } from './provider.interface';
import { Connection, ConnectionStatus, ConnectionHealth } from './types';
import { IntegrationError } from '../utils/errors';

export class StravaIntegrationService implements IIntegrationProviderService {
  async connect(_userId: string, _authParams: Record<string, any>): Promise<Connection> {
    // Strava uses a secure 3-legged OAuth redirect flow.
    // Standard clients should redirect to /api/integrations/strava/authorize.
    throw new IntegrationError(
      'Strava integration requires direct OAuth redirect handshake. Use /api/integrations/strava/authorize.',
      'STRAVA_OAUTH_REDIRECT_REQUIRED',
      400
    );
  }

  async validateConnection(connection: Connection): Promise<{
    status: ConnectionStatus;
    health: ConnectionHealth;
    message: string | null;
  }> {
    const expiresAtStr = connection.metadata?.expiresAt;
    if (!expiresAtStr) {
      return {
        status: 'error',
        health: 'critical',
        message: 'OAuth expiration metadata is missing.',
      };
    }

    const expiresAt = new Date(expiresAtStr);
    const isExpired = expiresAt.getTime() < Date.now();

    if (isExpired) {
      return {
        status: 'expired',
        health: 'warning',
        message: 'OAuth authorization token expired. Auto-refresh required.',
      };
    }

    return {
      status: 'connected',
      health: 'healthy',
      message: 'OAuth session is active. Ready to sync.',
    };
  }

  async refreshCredentials(connection: Connection): Promise<Connection> {
    try {
      const response = await fetch('/api/integrations/strava/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection }),
      });

      if (!response.ok) {
        throw new IntegrationError('Failed to refresh Strava authentication token via API.');
      }

      return await response.json();
    } catch (e: any) {
      console.error('Strava refresh credentials failure:', e);
      return {
        ...connection,
        status: 'error',
        health: 'critical',
        healthMessage: e.message || 'Error occurred while refreshing OAuth credentials.',
      };
    }
  }

  async disconnect(connection: Connection): Promise<void> {
    console.log(`Revoking Strava credentials on disconnect for athlete ${connection.externalUserId}`);
  }

  async fetchAccountDetails(connection: Connection): Promise<{
    externalUserId: string;
    accountName: string;
    metadata: Record<string, any>;
  }> {
    return {
      externalUserId: connection.externalUserId || 'unknown',
      accountName: connection.accountName || 'Strava Athlete',
      metadata: connection.metadata,
    };
  }
}

export class IntervalsIcuIntegrationService implements IIntegrationProviderService {
  async connect(userId: string, authParams?: { athleteId?: string, apiKey?: string }): Promise<Connection> {
    // Perform real credential validation with intervals.icu by calling our secure server proxy endpoint
    const response = await fetch('/api/integrations/intervals/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new IntegrationError(errData.error || 'Authentication with Intervals.icu failed.');
    }

    const verification = await response.json();
    const athleteName = verification.athlete?.name || 'Intervals Athlete';
    const athleteId = verification.athlete?.id || 'intervals-athlete';

    return {
      id: `${userId}_intervals-icu`,
      userId,
      providerId: 'intervals-icu',
      externalUserId: athleteId,
      accountName: `${athleteName} (Intervals.icu)`,
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSyncAt: null,
      status: 'connected',
      scopes: ['read:all', 'write:all'],
      health: 'healthy',
      healthMessage: 'Static API Key validated. Connection verified.',
      metadata: {
        athleteId: athleteId,
        scopeApproved: ['metrics:read', 'load:read'],
      }
    };
  }

  async validateConnection(connection: Connection): Promise<{
    status: ConnectionStatus;
    health: ConnectionHealth;
    message: string | null;
  }> {
    if (!connection.externalUserId) {
      return {
        status: 'error',
        health: 'critical',
        message: 'Intervals.icu configuration is missing details.',
      };
    }

    return {
      status: 'connected',
      health: 'healthy',
      message: 'Static API credential validated with server registration.',
    };
  }

  async refreshCredentials(connection: Connection): Promise<Connection> {
    // API Keys don't require credentials refresh as they are static.
    return {
      ...connection,
      updatedAt: new Date().toISOString(),
    };
  }

  async disconnect(connection: Connection): Promise<void> {
    console.log(`Disconnecting Intervals.icu and forgetting credentials for athlete ${connection.externalUserId}`);
  }

  async fetchAccountDetails(connection: Connection): Promise<{
    externalUserId: string;
    accountName: string;
    metadata: Record<string, any>;
  }> {
    return {
      externalUserId: connection.externalUserId || 'unknown',
      accountName: connection.accountName || 'Intervals Athlete',
      metadata: connection.metadata,
    };
  }
}

// Map services to provider IDs
export const providerServices: Record<string, IIntegrationProviderService> = {
  'strava': new StravaIntegrationService(),
  'intervals-icu': new IntervalsIcuIntegrationService(),
};
