import { IngestionErrorRecord, ErrorSeverity } from './types';

export class IngestionErrorRegistry {
  static create(params: {
    category: IngestionErrorRecord['category'];
    severity: ErrorSeverity;
    source: string;
    providerId: string;
    userId: string;
    syncJobId: string;
    message: string;
    suggestedResolution: string;
    details?: Record<string, any>;
  }): IngestionErrorRecord {
    const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return {
      id: `err_${Date.now()}_${randomId}`,
      category: params.category,
      severity: params.severity,
      source: params.source,
      timestamp: new Date().toISOString(),
      providerId: params.providerId,
      userId: params.userId,
      syncJobId: params.syncJobId,
      message: params.message,
      suggestedResolution: params.suggestedResolution,
      details: params.details || {}
    };
  }

  static authenticationError(userId: string, providerId: string, jobId: string, message: string, details?: Record<string, any>): IngestionErrorRecord {
    return this.create({
      category: 'authentication',
      severity: 'high',
      source: 'AuthenticationValidator',
      providerId,
      userId,
      syncJobId: jobId,
      message,
      suggestedResolution: 'Re-authorize the connection channel or verify credentials.',
      details
    });
  }

  static connectionError(userId: string, providerId: string, jobId: string, message: string, details?: Record<string, any>): IngestionErrorRecord {
    return this.create({
      category: 'connection',
      severity: 'high',
      source: 'ConnectionValidator',
      providerId,
      userId,
      syncJobId: jobId,
      message,
      suggestedResolution: 'Verify if the provider service is offline or has changed authorization parameters.',
      details
    });
  }

  static networkError(userId: string, providerId: string, jobId: string, message: string, details?: Record<string, any>): IngestionErrorRecord {
    return this.create({
      category: 'network',
      severity: 'medium',
      source: 'APIClient',
      providerId,
      userId,
      syncJobId: jobId,
      message,
      suggestedResolution: 'Retry after network connection restores. Backoff retry engine is running.',
      details
    });
  }

  static rateLimitedError(userId: string, providerId: string, jobId: string, message: string, details?: Record<string, any>): IngestionErrorRecord {
    return this.create({
      category: 'rate_limited',
      severity: 'medium',
      source: 'RateLimitEngine',
      providerId,
      userId,
      syncJobId: jobId,
      message,
      suggestedResolution: 'Cooldown initialized. The synchronization will pause and self-schedule a resume.',
      details
    });
  }

  static invalidResponseError(userId: string, providerId: string, jobId: string, message: string, details?: Record<string, any>): IngestionErrorRecord {
    return this.create({
      category: 'invalid_response',
      severity: 'high',
      source: 'ValidationEngine',
      providerId,
      userId,
      syncJobId: jobId,
      message,
      suggestedResolution: 'Examine API version compatibility. Inform administrator if the payload contains unexpected types.',
      details
    });
  }

  static paginationFailure(userId: string, providerId: string, jobId: string, message: string, details?: Record<string, any>): IngestionErrorRecord {
    return this.create({
      category: 'pagination_failure',
      severity: 'medium',
      source: 'PaginationEngine',
      providerId,
      userId,
      syncJobId: jobId,
      message,
      suggestedResolution: 'Ensure requesting window limit fits within vendor allowed boundaries.',
      details
    });
  }

  static validationFailure(userId: string, providerId: string, jobId: string, message: string, details?: Record<string, any>): IngestionErrorRecord {
    return this.create({
      category: 'validation_failure',
      severity: 'high',
      source: 'ValidationEngine',
      providerId,
      userId,
      syncJobId: jobId,
      message,
      suggestedResolution: 'Verify integrity check requirements. Malformed object or missing keys detected.',
      details
    });
  }

  static persistenceFailure(userId: string, providerId: string, jobId: string, message: string, details?: Record<string, any>): IngestionErrorRecord {
    return this.create({
      category: 'persistence_failure',
      severity: 'critical',
      source: 'PersistenceLayer',
      providerId,
      userId,
      syncJobId: jobId,
      message,
      suggestedResolution: 'Verify Firestore rules, write quotas, or connection status.',
      details
    });
  }

  static providerError(userId: string, providerId: string, jobId: string, message: string, details?: Record<string, any>): IngestionErrorRecord {
    return this.create({
      category: 'provider_error',
      severity: 'high',
      source: 'ProviderGateway',
      providerId,
      userId,
      syncJobId: jobId,
      message,
      suggestedResolution: 'The external service encountered an internal error. Check their status portal.',
      details
    });
  }

  static unexpectedError(userId: string, providerId: string, jobId: string, message: string, details?: Record<string, any>): IngestionErrorRecord {
    return this.create({
      category: 'unexpected',
      severity: 'high',
      source: 'UniversalSyncManager',
      providerId,
      userId,
      syncJobId: jobId,
      message,
      suggestedResolution: 'An unexpected execution thread failure occurred. Contact developer support.',
      details
    });
  }
}
