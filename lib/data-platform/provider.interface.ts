import { Connection, ConnectionStatus, ConnectionHealth } from './types';

export interface IIntegrationProviderService {
  /**
   * Generates a connection object after successful authorization.
   */
  connect(userId: string, authParams: Record<string, any>): Promise<Connection>;

  /**
   * Validates if the credentials or auth tokens are still active.
   */
  validateConnection(connection: Connection): Promise<{
    status: ConnectionStatus;
    health: ConnectionHealth;
    message: string | null;
  }>;

  /**
   * Refreshes credentials/tokens for OAuth2 providers.
   */
  refreshCredentials(connection: Connection): Promise<Connection>;

  /**
   * Disconnects the integration and revokes external credentials if supported.
   */
  disconnect(connection: Connection): Promise<void>;

  /**
   * Queries provider account/athlete details.
   */
  fetchAccountDetails(connection: Connection): Promise<{
    externalUserId: string;
    accountName: string;
    metadata: Record<string, any>;
  }>;
}
