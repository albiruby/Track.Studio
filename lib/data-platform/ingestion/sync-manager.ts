import { IngestionRepository } from './repository';
import { SyncJob, SyncStatus, RawDataRecord, AuditLogRecord } from './types';
import { environment } from '@/lib/config/environment';
import { ValidationEngine } from './validator';
import { Deduplicator } from './deduplicator';
import { RateLimitEngine } from './rate-limiter';
import { PaginationEngine, PaginationState } from './paginator';
import { IngestionErrorRegistry } from './error-registry';
import { ConnectionRepository } from '../repository';
import { Connection } from '../types';
import { CanonicalRepository } from '../canonical/repository';
import { StravaAdapter } from '../canonical/adapters/strava-adapter';
import { IntervalsAdapter } from '../canonical/adapters/intervals-adapter';
import { calculatePerformanceTrends, calculateCTLRampRate } from '@/lib/metrics/formulas/recovery';
import { getFirebaseFirestore } from '@/lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { CanonicalAthlete, CanonicalActivity, SourceMetadata } from '../canonical/types';

export interface SyncStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'completed_with_warnings' | 'failed' | 'warning';
  elapsedTimeMs: number;
  progressPercentage: number;
  processedRecords: number;
  warnings: string[];
  errors: string[];
  startTime?: number;
}

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
   * Runs the full ingestion pipeline with 12 real-time stages and incremental synchronization.
   */
  private static async runPipeline(job: SyncJob, initiatedBy: 'user' | 'system'): Promise<void> {
    const startTime = Date.now();
    let currentJob = { ...job, status: 'running' as SyncStatus, currentPage: 1 } as any;
    await IngestionRepository.saveSyncJob(currentJob);

    const warnings: string[] = [];
    const errors: string[] = [];
    let itemsDownloaded = 0;
    let itemsStored = 0;
    let itemsSkipped = 0;
    let itemsFailed = 0;

    const userId = job.userId;
    const providerId = job.providerId;

    const STAGE_NAMES = [
      'Authenticating',
      'Checking Permissions',
      'Fetching Activities',
      'Fetching Streams',
      'Fetching Laps',
      'Fetching Equipment',
      'Fetching Routes',
      'Normalizing',
      'Validating',
      'Saving',
      'Rebuilding Analytics',
      'Completed'
    ];

    const stages: Record<string, SyncStage> = {};
    for (const name of STAGE_NAMES) {
      stages[name] = {
        name,
        status: 'pending',
        elapsedTimeMs: 0,
        progressPercentage: 0,
        processedRecords: 0,
        warnings: [],
        errors: []
      };
    }

    let currentStageName = 'Authenticating';
    stages[currentStageName].status = 'running';
    stages[currentStageName].startTime = Date.now();

    const transitionToStage = async (nextStageName: string) => {
      const current = stages[currentStageName];
      if (current) {
        current.status = current.errors.length > 0 ? 'failed' : (current.warnings.length > 0 ? 'warning' : 'completed');
        if (current.startTime) {
          current.elapsedTimeMs = Date.now() - current.startTime;
        }
        current.progressPercentage = 100;
      }
      
      currentStageName = nextStageName;
      const next = stages[currentStageName];
      if (next) {
        next.status = 'running';
        next.startTime = Date.now();
        next.progressPercentage = 0;
      }
      
      currentJob.currentStage = currentStageName;
      currentJob.stages = { ...stages };
      const completedCount = STAGE_NAMES.filter(n => stages[n].status === 'completed' || stages[n].status === 'warning').length;
      currentJob.progress = Math.min(99, Math.round((completedCount / STAGE_NAMES.length) * 100));
      await IngestionRepository.saveSyncJob(currentJob);
    };

    const updateCurrentStage = async (updates: Partial<Omit<SyncStage, 'name'>>) => {
      const current = stages[currentStageName];
      if (current) {
        if (updates.status) current.status = updates.status;
        if (updates.progressPercentage !== undefined) current.progressPercentage = updates.progressPercentage;
        if (updates.processedRecords !== undefined) current.processedRecords = updates.processedRecords;
        if (updates.warnings) current.warnings = [...current.warnings, ...updates.warnings];
        if (updates.errors) current.errors = [...current.errors, ...updates.errors];
        
        if (current.startTime) {
          current.elapsedTimeMs = Date.now() - current.startTime;
        }
        currentJob.stages = { ...stages };
        await IngestionRepository.saveSyncJob(currentJob);
      }
    };

    try {
      // Stage 1: Authenticating
      const connections = await ConnectionRepository.getConnections(userId);
      const conn = connections.find((c) => c.providerId === providerId);
      if (!conn) {
        throw new Error(`Active connection profile not found for provider [${providerId}]. Pair the feed first.`);
      }

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

      let authHeader = '';
      let endpointBase = '';
      
      if (providerId === 'intervals-icu') {
        const { apiKey, athleteId } = credentials;
        if (!apiKey || !athleteId) {
          throw new Error('Intervals.icu connection is missing Athlete ID or personal API Key.');
        }
        authHeader = 'Basic ' + Buffer.from(`APIKEY:${apiKey}`).toString('base64');
        endpointBase = `${environment.intervals.apiBaseUrl}/athlete/${athleteId}`;
      } else if (providerId === 'strava') {
        let accessToken = credentials.accessToken;
        const expiresAtStr = credentials.expiresAt;
        
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
        endpointBase = environment.strava.apiBaseUrl;
      }

      await updateCurrentStage({ status: 'completed', processedRecords: 1 });

      // Stage 2: Checking Permissions
      await transitionToStage('Checking Permissions');
      const hasRequiredPermissions = providerId === 'strava' 
        ? (conn.scopes?.includes('activity:read') || conn.scopes?.includes('activity:read_all'))
        : true;

      if (!hasRequiredPermissions) {
        throw new Error(`Required OAuth permissions/scopes missing. Re-authorize connection to allow activity reading.`);
      }

      // Fetch Athlete Profile & Zones immediately to normalize user profile
      let athleteIdFromProvider = '';
      if (providerId === 'strava') {
        const athleteUrl = `${endpointBase}/athlete`;
        const athRes = await fetch(athleteUrl, { headers: { 'Authorization': authHeader } });
        if (athRes.ok) {
          const rawAthlete = await athRes.json();
          if (rawAthlete) {
            athleteIdFromProvider = String(rawAthlete.id);
            const hash = Deduplicator.computePayloadHash(rawAthlete);
            await IngestionRepository.saveRawData({
              id: `raw_athlete_${providerId}_${rawAthlete.id}`,
              userId,
              syncJobId: job.id,
              providerId,
              dataType: 'athlete',
              receivedTimestamp: new Date().toISOString(),
              providerVersion: 'v3',
              requestMetadata: { endpoint: athleteUrl, headersRedacted: ['Authorization'] },
              responseMetadata: { statusCode: athRes.status },
              payloadHash: hash,
              sourceEndpoint: athleteUrl,
              payload: rawAthlete
            });

            const adapter = new StravaAdapter();
            const canonicalAthlete = adapter.parseAthlete(rawAthlete, {
              rawDocumentId: `raw_athlete_${providerId}_${rawAthlete.id}`,
              syncJobId: job.id,
              apiEndpoint: athleteUrl,
              payloadHash: hash
            });
            await CanonicalRepository.saveAthlete(canonicalAthlete);
          }
        }

        // Fetch Zones
        const zonesUrl = `${endpointBase}/athlete/zones`;
        const zonesRes = await fetch(zonesUrl, { headers: { 'Authorization': authHeader } });
        if (zonesRes.ok) {
          const rawZones = await zonesRes.json();
          const hash = Deduplicator.computePayloadHash(rawZones);
          await IngestionRepository.saveRawData({
            id: `raw_zones_${providerId}_${userId}`,
            userId,
            syncJobId: job.id,
            providerId,
            dataType: 'zones',
            receivedTimestamp: new Date().toISOString(),
            providerVersion: 'v3',
            requestMetadata: { endpoint: zonesUrl, headersRedacted: ['Authorization'] },
            responseMetadata: { statusCode: zonesRes.status },
            payloadHash: hash,
            sourceEndpoint: zonesUrl,
            payload: rawZones
          });

          const source = {
            rawDocumentId: `raw_zones_${providerId}_${userId}`,
            syncJobId: job.id,
            apiEndpoint: zonesUrl,
            payloadHash: hash,
            providerId: 'strava' as const,
            providerObjectId: userId,
            providerApiVersion: 'v3',
            transformationVersion: '1.0.0',
            importedAt: new Date().toISOString()
          };
          
          if (rawZones.heart_rate?.zones) {
            const hrZones = {
              athleteId: userId,
              restingHeartRateBpm: 50,
              maxHeartRateBpm: 185,
              zones: rawZones.heart_rate.zones.map((z: any, idx: number) => ({
                name: `Zone ${idx + 1}`,
                minBpm: z.min,
                maxBpm: z.max
              })),
              sourceMetadata: source,
              metadata: { schemaVersion: '1.0.0', importedAt: new Date().toISOString(), transformationVersion: '1.0.0' }
            };
            await CanonicalRepository.saveHeartRateZones(hrZones, userId);
          }
          if (rawZones.power?.zones) {
            const powerZones = {
              athleteId: userId,
              ftpWatts: 250,
              zones: rawZones.power.zones.map((z: any, idx: number) => ({
                name: `Zone ${idx + 1}`,
                minWatts: z.min,
                maxWatts: z.max
              })),
              sourceMetadata: source,
              metadata: { schemaVersion: '1.0.0', importedAt: new Date().toISOString(), transformationVersion: '1.0.0' }
            };
            await CanonicalRepository.savePowerZones(powerZones, userId);
          }
        }
      } else if (providerId === 'intervals-icu') {
        const { athleteId } = credentials;
        const athleteUrl = `https://intervals.icu/api/v1/athlete/${athleteId}`;
        const athRes = await fetch(athleteUrl, { headers: { 'Authorization': authHeader } });
        if (athRes.ok) {
          const rawAthlete = await athRes.json();
          athleteIdFromProvider = String(rawAthlete.id);
          const hash = Deduplicator.computePayloadHash(rawAthlete);
          await IngestionRepository.saveRawData({
            id: `raw_athlete_${providerId}_${rawAthlete.id}`,
            userId,
            syncJobId: job.id,
            providerId,
            dataType: 'athlete',
            receivedTimestamp: new Date().toISOString(),
            providerVersion: 'v1',
            requestMetadata: { endpoint: athleteUrl, headersRedacted: ['Authorization'] },
            responseMetadata: { statusCode: athRes.status },
            payloadHash: hash,
            sourceEndpoint: athleteUrl,
            payload: rawAthlete
          });

          const adapter = new IntervalsAdapter();
          const canonicalAthlete = adapter.parseAthlete(rawAthlete, {
            rawDocumentId: `raw_athlete_${providerId}_${rawAthlete.id}`,
            syncJobId: job.id,
            apiEndpoint: athleteUrl,
            payloadHash: hash
          });
          await CanonicalRepository.saveAthlete(canonicalAthlete);

          const source = {
            rawDocumentId: `raw_athlete_${providerId}_${rawAthlete.id}`,
            syncJobId: job.id,
            apiEndpoint: athleteUrl,
            payloadHash: hash,
            providerId: 'intervals-icu' as const,
            providerObjectId: athleteId,
            providerApiVersion: 'v1',
            transformationVersion: '1.0.0',
            importedAt: new Date().toISOString()
          };

          if (rawAthlete.hr_zones) {
            const hrZones = {
              athleteId: userId,
              restingHeartRateBpm: rawAthlete.resting_hr || 50,
              maxHeartRateBpm: rawAthlete.max_hr || 185,
              zones: rawAthlete.hr_zones.map((bpm: number, idx: number) => ({
                name: `Zone ${idx + 1}`,
                minBpm: idx === 0 ? 0 : rawAthlete.hr_zones[idx - 1],
                maxBpm: bpm
              })),
              sourceMetadata: source,
              metadata: { schemaVersion: '1.0.0', importedAt: new Date().toISOString(), transformationVersion: '1.0.0' }
            };
            await CanonicalRepository.saveHeartRateZones(hrZones, userId);
          }

          if (rawAthlete.power_zones) {
            const powerZones = {
              athleteId: userId,
              ftpWatts: rawAthlete.ftp || 250,
              zones: rawAthlete.power_zones.map((watts: number, idx: number) => ({
                name: `Zone ${idx + 1}`,
                minWatts: idx === 0 ? 0 : rawAthlete.power_zones[idx - 1],
                maxWatts: watts
              })),
              sourceMetadata: source,
              metadata: { schemaVersion: '1.0.0', importedAt: new Date().toISOString(), transformationVersion: '1.0.0' }
            };
            await CanonicalRepository.savePowerZones(powerZones, userId);
          }
        }
      }

      await updateCurrentStage({ status: 'completed', processedRecords: conn.scopes?.length || 1 });

      // Stage 3: Fetching Activities
      await transitionToStage('Fetching Activities');

      const existingActivities = await CanonicalRepository.listActivities(userId, 500) || [];
      const existingIds = new Set(existingActivities.map(a => a.id));
      const providerActivities = existingActivities.filter(a => a.externalProviderId === providerId);
      const latestActivity = providerActivities.length > 0 ? providerActivities[0] : null;
      const latestStartDate = latestActivity ? latestActivity.startDate : null;
      
      if (latestStartDate) {
        console.log(`Incremental sync enabled. Querying activities after: ${latestStartDate}`);
      }

      const strategy = 'page';
      const paginator = PaginationEngine.initialize(strategy, 50);
      let pageState: PaginationState = { ...paginator };

      const rawActivitiesDownloaded: any[] = [];

      while (pageState.hasMore) {
        const freshJob = await IngestionRepository.getSyncJob(userId, job.id);
        if (freshJob && freshJob.cancellationState === 'requested') {
          currentJob.status = 'cancelled';
          currentJob.cancellationState = 'confirmed';
          currentJob.completedAt = new Date().toISOString();
          await IngestionRepository.saveSyncJob(currentJob);
          break;
        }

        let targetUrl = '';
        if (providerId === 'intervals-icu') {
          const offset = (pageState.currentPage - 1) * pageState.pageSize;
          targetUrl = `${endpointBase}/activities?limit=${pageState.pageSize}&offset=${offset}`;
          if (latestStartDate) {
            targetUrl += `&oldest=${encodeURIComponent(latestStartDate.slice(0, 10))}`;
          }
        } else if (providerId === 'strava') {
          targetUrl = `${endpointBase}/athlete/activities?page=${pageState.currentPage}&per_page=${pageState.pageSize}`;
          if (latestStartDate) {
            const afterEpoch = Math.floor(new Date(latestStartDate).getTime() / 1000);
            targetUrl += `&after=${afterEpoch}`;
          }
        }

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

          currentJob.status = 'waiting';
          currentJob.retryCount += 1;
          await IngestionRepository.saveSyncJob(currentJob);

          const delayMs = RateLimitEngine.getBackoffWithJitter(currentJob.retryCount, rateLimit.retryAfterSeconds);
          console.warn(`Rate limited. Backing off for ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue; 
        }

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

        const payload = await response.json();
        const pageItems = Array.isArray(payload) ? payload : [];
        
        if (pageItems.length === 0) {
          break;
        }

        // Identify new activities for detailed ingestion, while keeping summary for already synced ones
        const newPageItems: any[] = [];
        for (const item of pageItems) {
          const canonicalId = providerId === 'strava' ? `strava_${item.id}` : `intervals_${item.id}`;
          if (!existingIds.has(canonicalId)) {
            newPageItems.push(item);
          } else {
            rawActivitiesDownloaded.push(item);
            itemsDownloaded++;
          }
        }

        // Fetch details for new activities
        for (const summary of newPageItems) {
          try {
            const detailUrl = providerId === 'strava' 
              ? `${endpointBase}/activities/${summary.id}`
              : `${endpointBase}/activities/${summary.id}`;
            const detailRes = await fetch(detailUrl, { headers: { 'Authorization': authHeader } });
            if (detailRes.ok) {
              const rawDetail = await detailRes.json();
              
              const detailHash = Deduplicator.computePayloadHash(rawDetail);
              await IngestionRepository.saveRawData({
                id: `raw_detail_${providerId}_${summary.id}`,
                userId,
                syncJobId: job.id,
                providerId,
                dataType: 'activities',
                receivedTimestamp: new Date().toISOString(),
                providerVersion: providerId === 'strava' ? 'v3' : 'v1',
                requestMetadata: { endpoint: detailUrl, headersRedacted: ['Authorization'] },
                responseMetadata: { statusCode: detailRes.status },
                payloadHash: detailHash,
                sourceEndpoint: detailUrl,
                payload: rawDetail
              });

              rawActivitiesDownloaded.push(rawDetail);
              itemsDownloaded++;

              // Extract and persist splits
              if (providerId === 'strava') {
                const adapter = new StravaAdapter();
                if (Array.isArray(rawDetail.splits_metric)) {
                  let idx = 0;
                  for (const s of rawDetail.splits_metric) {
                    const split = adapter.parseSplit(s, `strava_${summary.id}`, idx++, 'kilometer');
                    await CanonicalRepository.saveSplit(split);
                  }
                }
                if (Array.isArray(rawDetail.splits_standard)) {
                  let idx = 0;
                  for (const s of rawDetail.splits_standard) {
                    const split = adapter.parseSplit(s, `strava_${summary.id}`, idx++, 'mile');
                    await CanonicalRepository.saveSplit(split);
                  }
                }
              }
            } else {
              rawActivitiesDownloaded.push(summary);
              itemsDownloaded++;
            }
          } catch (detailErr) {
            console.warn(`Failed to retrieve detail for activity ID ${summary.id}:`, detailErr);
            rawActivitiesDownloaded.push(summary);
            itemsDownloaded++;
          }
        }

        const hash = Deduplicator.computePayloadHash(payload);
        const rawId = `raw_${providerId}_page_${pageState.currentPage}_${hash}`;
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

        await updateCurrentStage({ progressPercentage: 50, processedRecords: itemsDownloaded });

        pageState = PaginationEngine.evaluateNextStep(pageState, payload, this.extractHeaders(response.headers));
      }

      await updateCurrentStage({ status: 'completed', progressPercentage: 100, processedRecords: itemsDownloaded });

      // Stage 4: Fetching Streams
      await transitionToStage('Fetching Streams');
      let fetchedStreamsCount = 0;
      const activitiesToFetchStreams = rawActivitiesDownloaded.slice(0, 10);

      for (const raw of activitiesToFetchStreams) {
        try {
          if (providerId === 'strava') {
            const streamsUrl = `${endpointBase}/activities/${raw.id}/streams?keys=time,distance,latlng,altitude,heartrate,cadence,watts,temp,moving&key_by_type=false`;
            const streamRes = await fetch(streamsUrl, {
              headers: { 'Authorization': authHeader }
            });
            if (streamRes.ok) {
              const rawStreams = await streamRes.json();
              const hash = Deduplicator.computePayloadHash(rawStreams);
              const sourceStream = {
                rawDocumentId: `raw_streams_${providerId}_${raw.id}`,
                syncJobId: job.id,
                apiEndpoint: streamsUrl,
                payloadHash: hash
              };
              const adapter = new StravaAdapter();
              const canonicalStream = adapter.parseStream(rawStreams, `strava_${raw.id}`, sourceStream);
              await CanonicalRepository.saveStream(canonicalStream, userId);
              fetchedStreamsCount++;
            }
          } else if (providerId === 'intervals-icu') {
            const streamsUrl = `${endpointBase}/activities/${raw.id}/streams`;
            const streamRes = await fetch(streamsUrl, {
              headers: { 'Authorization': authHeader }
            });
            if (streamRes.ok) {
              const rawStreams = await streamRes.json();
              const hash = Deduplicator.computePayloadHash(rawStreams);
              const sourceStream = {
                rawDocumentId: `raw_streams_${providerId}_${raw.id}`,
                syncJobId: job.id,
                apiEndpoint: streamsUrl,
                payloadHash: hash
              };
              const adapter = new IntervalsAdapter();
              const canonicalStream = adapter.parseStream(rawStreams, `intervals_${raw.id}`, sourceStream);
              await CanonicalRepository.saveStream(canonicalStream, userId);
              fetchedStreamsCount++;
            }
          }
        } catch (streamErr) {
          console.warn(`Could not retrieve streams for activity ID ${raw.id}:`, streamErr);
          warnings.push(`Stream fetch warning for raw ID ${raw.id}`);
        }
      }
      await updateCurrentStage({ status: 'completed', processedRecords: fetchedStreamsCount, warnings });

      // Stage 5: Fetching Laps
      await transitionToStage('Fetching Laps');
      let fetchedLapsCount = 0;
      for (const raw of activitiesToFetchStreams) {
        try {
          if (providerId === 'strava') {
            const lapsUrl = `${endpointBase}/activities/${raw.id}/laps`;
            const lapsRes = await fetch(lapsUrl, {
              headers: { 'Authorization': authHeader }
            });
            if (lapsRes.ok) {
              const rawLaps = await lapsRes.json();
              if (Array.isArray(rawLaps)) {
                const adapter = new StravaAdapter();
                let idx = 0;
                for (const rawLap of rawLaps) {
                  const sourceLap = {
                    rawDocumentId: `raw_lap_strava_${rawLap.id}`,
                    syncJobId: job.id,
                    apiEndpoint: lapsUrl,
                    payloadHash: Deduplicator.computePayloadHash(rawLap)
                  };
                  const canonicalLap = adapter.parseLap(rawLap, `strava_${raw.id}`, idx++, sourceLap);
                  await CanonicalRepository.saveLap(canonicalLap, userId);
                  fetchedLapsCount++;
                }
              }
            }
          } else if (providerId === 'intervals-icu') {
            // Laps are often directly embedded in detailed activity as "laps" or "ic_laps"
            if (raw.ic_laps && Array.isArray(raw.ic_laps)) {
              const adapter = new IntervalsAdapter();
              let idx = 0;
              for (const rawLap of raw.ic_laps) {
                const sourceLap = {
                  rawDocumentId: `raw_detail_intervals_${raw.id}`,
                  syncJobId: job.id,
                  apiEndpoint: 'local',
                  payloadHash: Deduplicator.computePayloadHash(rawLap)
                };
                const canonicalLap = adapter.parseLap(rawLap, `intervals_${raw.id}`, idx++, sourceLap);
                await CanonicalRepository.saveLap(canonicalLap, userId);
                fetchedLapsCount++;
              }
            }
          }
        } catch (lapErr) {
          console.warn(`Could not retrieve laps for activity ID ${raw.id}:`, lapErr);
        }
      }
      await updateCurrentStage({ status: 'completed', processedRecords: fetchedLapsCount });

      // Stage 6: Fetching Equipment
      await transitionToStage('Fetching Equipment');
      let fetchedGearCount = 0;
      const gearIds = new Set<string>();
      for (const raw of rawActivitiesDownloaded) {
        if (raw.gear_id) {
          gearIds.add(String(raw.gear_id));
        }
      }
      
      if (providerId === 'strava') {
        const adapter = new StravaAdapter();
        for (const gearId of gearIds) {
          try {
            const gearUrl = `${endpointBase}/gear/${gearId}`;
            const gearRes = await fetch(gearUrl, { headers: { 'Authorization': authHeader } });
            if (gearRes.ok) {
              const rawGear = await gearRes.json();
              const hash = Deduplicator.computePayloadHash(rawGear);
              await IngestionRepository.saveRawData({
                id: `raw_gear_${providerId}_${gearId}`,
                userId,
                syncJobId: job.id,
                providerId,
                dataType: 'gear',
                receivedTimestamp: new Date().toISOString(),
                providerVersion: 'v3',
                requestMetadata: { endpoint: gearUrl, headersRedacted: ['Authorization'] },
                responseMetadata: { statusCode: gearRes.status },
                payloadHash: hash,
                sourceEndpoint: gearUrl,
                payload: rawGear
              });

              const canonicalGear = adapter.mapToCanonical(rawGear, 'gear', {
                rawDocumentId: `raw_gear_${providerId}_${gearId}`,
                syncJobId: job.id,
                apiEndpoint: gearUrl,
                payloadHash: hash
              });
              await CanonicalRepository.saveGear(canonicalGear);
              fetchedGearCount++;
            }
          } catch (gearErr) {
            console.warn(`Failed to fetch gear detail for ${gearId}:`, gearErr);
          }
        }
      } else if (providerId === 'intervals-icu') {
        const adapter = new IntervalsAdapter();
        for (const gearId of gearIds) {
          try {
            const canonicalGear = adapter.mapToCanonical({ id: gearId, name: 'Intervals Shoe', primary: true }, 'gear', {
              rawDocumentId: `raw_gear_${providerId}_${gearId}`,
              syncJobId: job.id,
              apiEndpoint: 'local',
              payloadHash: 'summary_gear'
            });
            await CanonicalRepository.saveGear(canonicalGear);
            fetchedGearCount++;
          } catch (gearErr) {
            console.warn(`Failed to save Intervals gear:`, gearErr);
          }
        }
      }
      await updateCurrentStage({ status: 'completed', processedRecords: fetchedGearCount });

      // Stage 7: Fetching Routes
      await transitionToStage('Fetching Routes');
      let fetchedRoutesCount = 0;
      if (providerId === 'strava') {
        const adapter = new StravaAdapter();
        try {
          const routesUrl = `${endpointBase}/athletes/${athleteIdFromProvider || 'me'}/routes`;
          const routesRes = await fetch(routesUrl, { headers: { 'Authorization': authHeader } });
          if (routesRes.ok) {
            const rawRoutes = await routesRes.json();
            if (Array.isArray(rawRoutes)) {
              for (const rawRoute of rawRoutes) {
                const hash = Deduplicator.computePayloadHash(rawRoute);
                await IngestionRepository.saveRawData({
                  id: `raw_route_${providerId}_${rawRoute.id}`,
                  userId,
                  syncJobId: job.id,
                  providerId,
                  dataType: 'routes',
                  receivedTimestamp: new Date().toISOString(),
                  providerVersion: 'v3',
                  requestMetadata: { endpoint: routesUrl, headersRedacted: ['Authorization'] },
                  responseMetadata: { statusCode: routesRes.status },
                  payloadHash: hash,
                  sourceEndpoint: routesUrl,
                  payload: rawRoute
                });

                const canonicalRoute = adapter.parseRoute(rawRoute, {
                  rawDocumentId: `raw_route_${providerId}_${rawRoute.id}`,
                  syncJobId: job.id,
                  apiEndpoint: routesUrl,
                  payloadHash: hash
                });
                await CanonicalRepository.saveRoute(canonicalRoute);
                fetchedRoutesCount++;
              }
            }
          }
        } catch (routeErr) {
          console.warn('Failed to fetch Strava routes:', routeErr);
        }
      } else if (providerId === 'intervals-icu') {
        const adapter = new IntervalsAdapter();
        try {
          const routesUrl = `https://intervals.icu/api/v1/athlete/${athleteIdFromProvider || 'me'}/routes`;
          const routesRes = await fetch(routesUrl, { headers: { 'Authorization': authHeader } });
          if (routesRes.ok) {
            const rawRoutes = await routesRes.json();
            if (Array.isArray(rawRoutes)) {
              for (const rawRoute of rawRoutes) {
                const hash = Deduplicator.computePayloadHash(rawRoute);
                const canonicalRoute = adapter.parseRoute(rawRoute, {
                  rawDocumentId: `raw_route_${providerId}_${rawRoute.id}`,
                  syncJobId: job.id,
                  apiEndpoint: routesUrl,
                  payloadHash: hash
                });
                await CanonicalRepository.saveRoute(canonicalRoute);
                fetchedRoutesCount++;
              }
            }
          }
        } catch (routeErr) {
          console.warn('Failed to fetch Intervals routes:', routeErr);
        }
      }

      // Fetch Wellness & Workout Calendar (Intervals.icu specific)
      if (providerId === 'intervals-icu') {
        // Wellness Data (Sleep, HRV, Weight, Readiness, FTP events)
        try {
          const wellnessUrl = `https://intervals.icu/api/v1/athlete/${athleteIdFromProvider || 'me'}/wellness?oldest=2026-01-01&newest=2026-12-31`;
          const wellnessRes = await fetch(wellnessUrl, { headers: { 'Authorization': authHeader } });
          if (wellnessRes.ok) {
            const rawWellnessList = await wellnessRes.json();
            if (Array.isArray(rawWellnessList)) {
              const hash = Deduplicator.computePayloadHash(rawWellnessList);
              await IngestionRepository.saveRawData({
                id: `raw_wellness_${providerId}_${userId}`,
                userId,
                syncJobId: job.id,
                providerId,
                dataType: 'wellness' as any,
                receivedTimestamp: new Date().toISOString(),
                providerVersion: 'v1',
                requestMetadata: { endpoint: wellnessUrl, headersRedacted: ['Authorization'] },
                responseMetadata: { statusCode: wellnessRes.status },
                payloadHash: hash,
                sourceEndpoint: wellnessUrl,
                payload: rawWellnessList
              });

              for (const item of rawWellnessList) {
                const canonicalWellness = {
                  id: `intervals_wellness_${item.id || item.date}`,
                  athleteId: userId,
                  date: item.id || item.date,
                  sleepSec: typeof item.sleepSec === 'number' ? item.sleepSec : (typeof item.sleep === 'number' ? item.sleep * 3600 : null),
                  avgHeartRate: item.avgHeartRate || null,
                  restingHeartRate: item.restingHR || null,
                  hrv: item.hrv || item.hrvSDNN || null,
                  weightKg: item.weight || null,
                  bodyFatPercent: item.bodyFat || null,
                  readiness: item.readiness || null,
                  sourceMetadata: {
                    providerId: 'intervals-icu' as const,
                    providerObjectId: String(item.id || item.date),
                    rawDocumentId: `raw_wellness_${providerId}_${userId}`,
                    syncJobId: job.id,
                    apiEndpoint: wellnessUrl,
                    payloadHash: hash,
                    providerApiVersion: 'v1',
                    transformationVersion: '1.0.0',
                    importedAt: new Date().toISOString()
                  },
                  metadata: { schemaVersion: '1.0.0', importedAt: new Date().toISOString(), transformationVersion: '1.0.0' }
                };
                await CanonicalRepository.saveWellness(canonicalWellness, userId);
              }
            }
          }
        } catch (wellnessErr) {
          console.warn('Failed to fetch wellness data:', wellnessErr);
        }

        // Workout Calendar (Planned & Completed events)
        try {
          const calendarUrl = `https://intervals.icu/api/v1/athlete/${athleteIdFromProvider || 'me'}/events?oldest=2026-01-01&newest=2026-12-31`;
          const calendarRes = await fetch(calendarUrl, { headers: { 'Authorization': authHeader } });
          if (calendarRes.ok) {
            const rawCalendar = await calendarRes.json();
            if (Array.isArray(rawCalendar)) {
              const hash = Deduplicator.computePayloadHash(rawCalendar);
              await IngestionRepository.saveRawData({
                id: `raw_calendar_${providerId}_${userId}`,
                userId,
                syncJobId: job.id,
                providerId,
                dataType: 'calendar' as any,
                receivedTimestamp: new Date().toISOString(),
                providerVersion: 'v1',
                requestMetadata: { endpoint: calendarUrl, headersRedacted: ['Authorization'] },
                responseMetadata: { statusCode: calendarRes.status },
                payloadHash: hash,
                sourceEndpoint: calendarUrl,
                payload: rawCalendar
              });

              for (const event of rawCalendar) {
                const canonicalEvent = {
                  id: `intervals_event_${event.id}`,
                  athleteId: userId,
                  title: event.name || event.title || 'Planned Workout',
                  description: event.description || null,
                  startDate: event.start_date || event.start_date_local || null,
                  endDate: event.end_date || null,
                  type: event.type || 'workout',
                  plannedDistance: event.distance || null,
                  plannedDuration: event.duration || null,
                  completed: !!event.completed,
                  sourceMetadata: {
                    providerId: 'intervals-icu' as const,
                    providerObjectId: String(event.id),
                    rawDocumentId: `raw_calendar_${providerId}_${userId}`,
                    syncJobId: job.id,
                    apiEndpoint: calendarUrl,
                    payloadHash: hash,
                    providerApiVersion: 'v1',
                    transformationVersion: '1.0.0',
                    importedAt: new Date().toISOString()
                  },
                  metadata: { schemaVersion: '1.0.0', importedAt: new Date().toISOString(), transformationVersion: '1.0.0' }
                };
                await CanonicalRepository.saveCalendarEvent(canonicalEvent, userId);
              }
            }
          }
        } catch (calendarErr) {
          console.warn('Failed to fetch calendar events:', calendarErr);
        }
      }

      await updateCurrentStage({ status: 'completed', processedRecords: fetchedRoutesCount });

      // Stage 8: Normalizing
      await transitionToStage('Normalizing');
      const adapter = providerId === 'strava' ? new StravaAdapter() : new IntervalsAdapter();
      const canonicalActivities: CanonicalActivity[] = [];

      for (const raw of rawActivitiesDownloaded) {
        try {
          const rawHash = Deduplicator.computePayloadHash(raw);
          const source = {
            rawDocumentId: raw.id ? `raw_detail_${providerId}_${raw.id}` : `raw_${providerId}_${raw.id || 'summary'}`,
            syncJobId: job.id,
            apiEndpoint: `${endpointBase}/activities`,
            payloadHash: rawHash
          };
          const canonical = adapter.parseActivity(raw, source);
          canonical.sourceMetadata = {
            ...canonical.sourceMetadata,
            validationStatus: 'passed',
            calculationDependencies: ['CTL', 'ATL', 'TSB', 'RSS', 'IF', 'EF', 'PV']
          };
          canonical.metadata = {
            ...canonical.metadata,
            schemaVersion: '1.0.0',
            transformationVersion: '1.0.0'
          };
          canonicalActivities.push(canonical);
        } catch (normErr: any) {
          console.error(`Normalization failed for raw ID ${raw.id}:`, normErr);
          errors.push(`Normalization failed for activity ID ${raw.id}`);
        }
      }
      await updateCurrentStage({ status: errors.length > 0 ? 'warning' : 'completed', processedRecords: canonicalActivities.length });

      // Stage 9: Validating
      await transitionToStage('Validating');
      let validatedCount = 0;
      for (const canonical of canonicalActivities) {
        if (canonical.id && canonical.athleteId && canonical.startDate && canonical.elapsedTimeSec >= 0) {
          validatedCount++;
        } else {
          warnings.push(`Validation alert: activity ${canonical.id} has invalid coordinates or fields.`);
        }
      }
      await updateCurrentStage({ status: 'completed', processedRecords: validatedCount });

      // Stage 10: Saving
      await transitionToStage('Saving');
      let savedCount = 0;
      for (const canonical of canonicalActivities) {
        const dupResult = Deduplicator.findDuplicate(canonical, existingActivities);
        if (dupResult) {
          const { duplicate, reason } = dupResult;
          console.log(`Duplicate activity found: ${canonical.id}. Reason: ${reason}. Merging metadata...`);
          const merged = {
            ...duplicate,
            ...canonical,
            createdAt: duplicate.createdAt,
            updatedAt: new Date().toISOString()
          };
          await CanonicalRepository.saveActivity(merged);
          itemsSkipped++;
        } else {
          await CanonicalRepository.saveActivity(canonical);
          savedCount++;
          itemsStored++;
          existingActivities.unshift(canonical);
        }
      }
      await updateCurrentStage({ status: 'completed', processedRecords: savedCount });

      // Stage 11: Rebuilding Analytics
      await transitionToStage('Rebuilding Analytics');
      let athlete = await CanonicalRepository.getAthlete(userId, userId);
      if (!athlete) {
        athlete = {
          id: userId,
          firstName: conn.accountName?.split(' ')[0] || 'Athlete',
          lastName: conn.accountName?.split(' ').slice(1).join(' ') || '',
          profileUrl: null,
          gender: 'M',
          weightKg: 70,
          restingHeartRateBpm: 50,
          maxHeartRateBpm: 185,
          ftpWatts: 250,
          vO2Max: 50,
          timezone: 'UTC',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sourceMetadata: {
            providerId: 'strava',
            providerObjectId: userId,
            rawDocumentId: `raw_athlete_${userId}`,
            syncJobId: job.id,
            apiEndpoint: 'local',
            payloadHash: 'initial_profile',
            providerApiVersion: 'v1',
            transformationVersion: '1.0.0',
            importedAt: new Date().toISOString()
          },
          metadata: {
            schemaVersion: '1.0.0',
            importedAt: new Date().toISOString(),
            transformationVersion: '1.0.0'
          }
        };
        await CanonicalRepository.saveAthlete(athlete);
      }

      const allUserActivities = await CanonicalRepository.listActivities(userId, 500) || [];
      const sorted = [...allUserActivities].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      const trends = calculatePerformanceTrends(sorted, athlete);
      const firestore = getFirebaseFirestore();
      
      if (trends.length > 0) {
        const lastTrend = trends[trends.length - 1];
        const rampRate = calculateCTLRampRate(sorted, athlete);
        const trendDoc = {
          userId,
          currentFitness: lastTrend.ctl,
          currentFatigue: lastTrend.atl,
          currentForm: lastTrend.tsb,
          ctlRampRate: rampRate,
          calculatedAt: new Date().toISOString()
        };
        
        if (firestore) {
          const docRef = doc(firestore, 'trends', userId);
          await setDoc(docRef, trendDoc);
        }
        console.log(`Successfully rebuilt and saved trends for athlete ${userId}`);

        // Persist daily fitness history to canonical_fitness_history subcollection
        for (const pt of trends) {
          const histDoc = {
            userId,
            date: pt.date,
            fitness: pt.ctl,
            fatigue: pt.atl,
            form: pt.tsb,
            calculatedAt: new Date().toISOString()
          };
          await CanonicalRepository.saveFitnessHistory(histDoc, userId);
        }
      }

      await updateCurrentStage({ status: 'completed', processedRecords: trends.length });

      // Stage 12: Completed
      await transitionToStage('Completed');

      // Finish Ingestion
      if (currentJob.status !== 'cancelled') {
        currentJob.status = errors.length > 0 || warnings.length > 0 ? 'completed_with_warnings' : 'completed';
        currentJob.progress = 100;
        currentJob.itemsProcessed = itemsDownloaded;
        currentJob.itemsImported = itemsStored;
        currentJob.itemsFailed = itemsFailed;
        currentJob.completedAt = new Date().toISOString();
        await IngestionRepository.saveSyncJob(currentJob);

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
