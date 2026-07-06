import { IngestionRepository } from './repository';
import { SyncJob, SyncStatus, RawDataRecord, AuditLogRecord } from './types';
import { ValidationEngine } from './validator';
import { Deduplicator } from './deduplicator';
import { RateLimitEngine } from './rate-limiter';
import { PaginationEngine, PaginationState } from './paginator';
import { IngestionErrorRegistry } from './error-registry';
import { ConnectionRepository } from '../repository';
import { Connection } from '../types';

export class UniversalSyncManager {
  /**
   * Spawns and registers a new Sync Job for a user and provider.
   */
  static async startSyncJob(userId: string, providerId: string, initiatedBy: 'user' | 'system' = 'user'): Promise<SyncJob> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job: SyncJob = {
      id: jobId,
      providerId,
      userId,
      status: 'queued',
      startedAt: new Date().toISOString(),
      completedAt: null,
      progress: 0,
      currentPage: 0,
      itemsProcessed: 0,
      itemsImported: 0,
      itemsFailed: 0,
      retryCount: 0,
      durationMs: 0,
      lastError: null,
      cancellationState: 'none',
    };

    await IngestionRepository.saveSyncJob(job);
    
    // Kick off processing in the background (using async execution without blocking the response)
    this.runPipeline(job, initiatedBy).catch((e) => {
      console.error('UniversalSyncManager background execution crash:', e);
    });

    return job;
  }

  /**
   * Runs the full ingestion pipeline.
   */
  private static async runPipeline(job: SyncJob, initiatedBy: 'user' | 'system'): Promise<void> {
    const startTime = Date.now();
    let currentJob = { ...job, status: 'running' as SyncStatus, currentPage: 1 };
    await IngestionRepository.saveSyncJob(currentJob);

    const warnings: string[] = [];
    const errors: string[] = [];
    let itemsDownloaded = 0;
    let itemsStored = 0;
    let itemsSkipped = 0;
    let itemsFailed = 0;

    const userId = job.userId;
    const providerId = job.providerId;

    try {
      // 1. Connection Validation
      const connections = await ConnectionRepository.getConnections(userId);
      const conn = connections.find((c) => c.providerId === providerId);
      if (!conn) {
        throw new Error(`Active connection profile not found for provider [${providerId}]. Pair the feed first.`);
      }

      // 2. Authentication Credentials Retrieval
      const credentials = await IngestionRepository.getSecureCredentials(userId, providerId);
      if (!credentials) {
        const err = IngestionErrorRegistry.authenticationError(
          userId,
          providerId,
          job.id,
          'Authorization secrets not found in secure credentials sub-collection. Connection requires re-authentication.'
        );
        await IngestionRepository.saveIngestionError(err);
        throw new Error(err.message);
      }

      // 3. Setup Provider-Specific Request Auth Headers
      let authHeader = '';
      let endpointBase = '';
      
      if (providerId === 'intervals-icu') {
        const { apiKey, athleteId } = credentials;
        if (!apiKey || !athleteId) {
          throw new Error('Intervals.icu connection is missing Athlete ID or personal API Key.');
        }
        authHeader = 'Basic ' + Buffer.from(`APIKEY:${apiKey}`).toString('base64');
        endpointBase = `https://intervals.icu/api/v1/athlete/${athleteId}`;
      } else if (providerId === 'strava') {
        let accessToken = credentials.accessToken;
        const expiresAtStr = credentials.expiresAt;
        
        // Check Token Expiration for Strava OAuth
        if (expiresAtStr && new Date(expiresAtStr).getTime() < Date.now()) {
          console.log('Strava access token expired. Triggering OAuth token refresh...');
          try {
            const refreshed = await this.refreshStravaTokens(userId, credentials.refreshToken);
            accessToken = refreshed.accessToken;
          } catch (refreshErr: any) {
            const err = IngestionErrorRegistry.authenticationError(
              userId,
              providerId,
              job.id,
              `Strava OAuth token refresh failed: ${refreshErr.message || refreshErr}`
            );
            await IngestionRepository.saveIngestionError(err);
            throw new Error(err.message);
          }
        }
        authHeader = `Bearer ${accessToken}`;
        endpointBase = 'https://www.strava.com/api/v3';
      }

      // 4. Initialize Pagination Engine
      const strategy = providerId === 'strava' ? 'page' : 'page'; // Intervals is page-based as well
      const paginator = PaginationEngine.initialize(strategy, 50);
      let pageState: PaginationState = { ...paginator };

      // 5. Ingestion Loop
      while (pageState.hasMore) {
        // Check for Job Cancellation
        const freshJob = await IngestionRepository.getSyncJob(userId, job.id);
        if (freshJob && freshJob.cancellationState === 'requested') {
          currentJob.status = 'cancelled';
          currentJob.cancellationState = 'confirmed';
          currentJob.completedAt = new Date().toISOString();
          await IngestionRepository.saveSyncJob(currentJob);
          break;
        }

        // Setup request details
        let targetUrl = '';
        if (providerId === 'intervals-icu') {
          // Intervals.icu paginates using date parameters (oldest/newest) or standard offsets. 
          // For simple runs, page acts as offset: page 1 = offset 0, page 2 = offset 50
          const offset = (pageState.currentPage - 1) * pageState.pageSize;
          targetUrl = `${endpointBase}/activities?limit=${pageState.pageSize}&offset=${offset}`;
        } else if (providerId === 'strava') {
          targetUrl = `${endpointBase}/athlete/activities?page=${pageState.currentPage}&per_page=${pageState.pageSize}`;
        }

        // Rate Limit Safe Hold
        currentJob.status = 'running';
        currentJob.currentPage = pageState.currentPage;
        currentJob.progress = Math.min(95, Math.round((pageState.currentPage / 5) * 100)); // incremental pseudo progression capped at 95%
        await IngestionRepository.saveSyncJob(currentJob);

        console.log(`Ingesting ${providerId} page ${pageState.currentPage} from URL: ${targetUrl}`);

        const fetchStart = Date.now();
        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
          },
        });

        const durationMs = Date.now() - fetchStart;

        // 6. Rate Limit Handling
        const rateLimit = RateLimitEngine.detect(response.status, this.extractHeaders(response.headers));
        if (rateLimit.isLimited) {
          const errRecord = IngestionErrorRegistry.rateLimitedError(
            userId,
            providerId,
            job.id,
            rateLimit.reason
          );
          await IngestionRepository.saveIngestionError(errRecord);
          warnings.push(rateLimit.reason);

          // Cooldown sleep with jitter
          currentJob.status = 'waiting';
          currentJob.retryCount += 1;
          await IngestionRepository.saveSyncJob(currentJob);

          const delayMs = RateLimitEngine.getBackoffWithJitter(currentJob.retryCount, rateLimit.retryAfterSeconds);
          console.warn(`Rate limited. Backing off for ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue; // Retry same request
        }

        // 7. Check Ingestion Failures
        if (!response.ok) {
          const errBody = await response.text();
          const msg = `API request failed with status code ${response.status}. Details: ${errBody}`;
          
          let errRecord;
          if (response.status === 401 || response.status === 403) {
            errRecord = IngestionErrorRegistry.authenticationError(userId, providerId, job.id, msg);
          } else {
            errRecord = IngestionErrorRegistry.providerError(userId, providerId, job.id, msg);
          }
          
          await IngestionRepository.saveIngestionError(errRecord);
          throw new Error(errRecord.message);
        }

        // 8. Capture raw data
        const payload = await response.json();
        itemsDownloaded += Array.isArray(payload) ? payload.length : 1;

        // 9. Validation
        const validation = ValidationEngine.validateResponse(payload, providerId, 'activities');
        if (!validation.isValid) {
          const errMsg = `Validation checklist failed for page ${pageState.currentPage}: ${validation.errors.join(', ')}`;
          const errRecord = IngestionErrorRegistry.validationFailure(userId, providerId, job.id, errMsg);
          await IngestionRepository.saveIngestionError(errRecord);
          errors.push(errMsg);
          itemsFailed += validation.metadata.itemCount;
          throw new Error(errMsg);
        }

        validation.warnings.forEach(w => warnings.push(w));

        // 10. Deduplication & Immutable Persistence
        const hash = Deduplicator.computePayloadHash(payload);
        const isDuplicateHash = await IngestionRepository.isPayloadHashDuplicate(userId, providerId, hash);

        if (isDuplicateHash) {
          console.log(`Page ${pageState.currentPage} contains a duplicate payload hash (${hash}). Skipping persistence.`);
          itemsSkipped += Array.isArray(payload) ? payload.length : 1;
        } else {
          // Write unmutated raw page payload to Firestore
          const rawId = `raw_${providerId}_${hash}`;
          const rawRecord: RawDataRecord = {
            id: rawId,
            userId,
            syncJobId: job.id,
            providerId,
            dataType: 'activities',
            receivedTimestamp: new Date().toISOString(),
            providerVersion: providerId === 'strava' ? 'v3' : 'v1',
            requestMetadata: {
              endpoint: targetUrl,
              headersRedacted: ['Authorization']
            },
            responseMetadata: {
              statusCode: response.status,
            },
            payloadHash: hash,
            sourceEndpoint: targetUrl,
            payload
          };

          await IngestionRepository.saveRawData(rawRecord);
          itemsStored += Array.isArray(payload) ? payload.length : 1;
        }

        // Evaluate Next Page
        pageState = PaginationEngine.evaluateNextStep(pageState, payload, this.extractHeaders(response.headers));
      }

      // Finish Ingestion
      if (currentJob.status !== 'cancelled') {
        currentJob.status = errors.length > 0 || warnings.length > 0 ? 'completed_with_warnings' : 'completed';
        currentJob.progress = 100;
        currentJob.itemsProcessed = itemsDownloaded;
        currentJob.itemsImported = itemsStored;
        currentJob.itemsFailed = itemsFailed;
        currentJob.completedAt = new Date().toISOString();
        await IngestionRepository.saveSyncJob(currentJob);

        // Update Connection Last Sync timestamp
        const fullConn = conn as Connection;
        const updatedConn: Connection = {
          ...fullConn,
          lastSyncAt: new Date().toISOString(),
          status: 'connected',
          updatedAt: new Date().toISOString()
        };
        await ConnectionRepository.saveConnection(updatedConn);
      }

    } catch (pipelineError: any) {
      console.error('Ingestion pipeline execution failed:', pipelineError);
      
      currentJob.status = 'failed';
      currentJob.lastError = pipelineError.message || 'Pipeline process crashed.';
      currentJob.completedAt = new Date().toISOString();
      await IngestionRepository.saveSyncJob(currentJob);

      // Save to error registry if not already registered
      const errRecord = IngestionErrorRegistry.unexpectedError(
        userId,
        providerId,
        job.id,
        pipelineError.message || 'Unexpected ingestion pipeline failure.'
      );
      await IngestionRepository.saveIngestionError(errRecord);
      errors.push(pipelineError.message);
    } finally {
      const finalDuration = Date.now() - startTime;

      // 11. Complete Audit Log Record
      const auditLog: AuditLogRecord = {
        id: `audit_${job.id}`,
        userId,
        providerId,
        syncJobId: job.id,
        initiatedBy: initiatedBy === 'user' ? 'user' : 'system',
        timestamp: new Date().toISOString(),
        durationMs: finalDuration,
        itemsDownloaded,
        itemsStored,
        itemsSkipped,
        itemsFailed,
        warnings,
        errors,
        apiVersion: providerId === 'strava' ? 'v3' : 'v1',
        requestWindow: {
          start: new Date(startTime).toISOString(),
          end: new Date().toISOString(),
        },
        completionState: currentJob.status,
      };

      await IngestionRepository.saveAuditLog(auditLog);
      
      // Also register as SyncAttempt for legacy Connection center inspect logs
      const { ConnectionRepository } = await import('../repository');
      await ConnectionRepository.saveSyncAttempt(userId, providerId, {
        id: `attempt_${job.id}`,
        connectionId: `${userId}_${providerId}`,
        timestamp: new Date().toISOString(),
        status: currentJob.status.startsWith('completed') ? 'success' : 'failed',
        recordsSynced: itemsStored,
        errorLog: currentJob.lastError,
        durationMs: finalDuration
      });
    }
  }

  /**
   * Refreshes Strava OAuth refresh tokens.
   */
  private static async refreshStravaTokens(userId: string, refreshToken: string): Promise<{ accessToken: string }> {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Strava OAuth credentials (Client ID / Client Secret) missing on server.');
    }

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Strava token refresh endpoint rejected credentials: ${body}`);
    }

    const data = await response.json();
    const { access_token, refresh_token, expires_at } = data;

    // Save updated credentials in secure storage
    await IngestionRepository.saveSecureCredentials(userId, 'strava', {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(expires_at * 1000).toISOString(),
    });

    // Also update connection metadata
    const connections = await ConnectionRepository.getConnections(userId);
    const conn = connections.find((c) => c.providerId === 'strava');
    if (conn) {
      const updatedConn: Connection = {
        ...conn,
        updatedAt: new Date().toISOString(),
        metadata: {
          ...conn.metadata,
          expiresAt: new Date(expires_at * 1000).toISOString(),
          refreshTokenRedacted: '••••••••' + refresh_token.slice(-4),
          accessTokenRedacted: '••••••••' + access_token.slice(-4),
        }
      };
      await ConnectionRepository.saveConnection(updatedConn);
    }

    return { accessToken: access_token };
  }

  /**
   * Converts Headers to record key-value pairs.
   */
  private static extractHeaders(headers: Headers): Record<string, string> {
    const obj: Record<string, string> = {};
    headers.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  }
}
