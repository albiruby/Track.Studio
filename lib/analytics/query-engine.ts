import { 
  CanonicalAthlete, 
  CanonicalActivity, 
  CanonicalGear, 
  CanonicalRoute, 
  CanonicalSplit, 
  CanonicalLap, 
  CanonicalStream 
} from '@/lib/data-platform/canonical/types';
import { ComputedMetric } from '@/lib/metrics/types';
import { Decision } from '@/lib/decision-engine/types';
import { 
  HomeDashboardViewModel, 
  PerformanceOverviewViewModel, 
  ActivitySummaryViewModel, 
  ActivityDetailViewModel, 
  WeeklyTrainingViewModel, 
  MonthlyTrainingViewModel, 
  HeartRateOverviewViewModel, 
  PowerOverviewViewModel, 
  CadenceOverviewViewModel, 
  TrainingLoadOverviewViewModel, 
  RecoveryOverviewViewModel, 
  EnvironmentOverviewViewModel, 
  EquipmentOverviewViewModel, 
  SyncHealthViewModel, 
  DataHealthViewModel, 
  SearchResultViewModel, 
  CompareViewModel, 
  TimelineViewModel, 
  AthleteProfileViewModel, 
  SettingsViewModel 
} from './types';
import { 
  HomeDashboardViewBuilder, 
  PerformanceOverviewViewBuilder, 
  ActivitySummaryViewBuilder, 
  ActivityDetailViewBuilder, 
  WeeklyTrainingViewBuilder, 
  MonthlyTrainingViewBuilder, 
  HeartRateOverviewViewBuilder, 
  PowerOverviewViewBuilder, 
  CadenceOverviewViewBuilder, 
  TrainingLoadOverviewViewBuilder, 
  RecoveryOverviewViewBuilder, 
  EnvironmentOverviewViewBuilder, 
  EquipmentOverviewViewBuilder, 
  SyncHealthViewBuilder, 
  DataHealthViewBuilder, 
  SearchResultViewBuilder, 
  CompareViewBuilder, 
  TimelineViewBuilder, 
  AthleteProfileViewBuilder, 
  SettingsViewBuilder 
} from './view-builders';
import { AnalyticsCache } from './cache';
import { ViewRegistry } from './registry';
import { CanonicalRepository } from '@/lib/data-platform/canonical/repository';
import { ConnectionRepository } from '@/lib/data-platform/repository';

export interface QueryContext {
  athlete?: CanonicalAthlete;
  activities?: CanonicalActivity[];
  laps?: CanonicalLap[];
  splits?: CanonicalSplit[];
  streams?: Record<string, CanonicalStream>;
  gear?: CanonicalGear[];
  routes?: CanonicalRoute[];
  metrics?: ComputedMetric[];
  decisions?: Decision[];
  connections?: any[];
  syncAttempts?: any[];
}

export interface FilterParams {
  startDate?: string;
  endDate?: string;
  sportType?: 'running' | 'trail_running' | 'other';
  minDistance?: number;
  maxDistance?: number;
  minDuration?: number;
  maxDuration?: number;
  minPace?: number;
  maxPace?: number;
  minSpeed?: number;
  maxSpeed?: number;
  minHeartRate?: number;
  maxHeartRate?: number;
  minPower?: number;
  maxPower?: number;
  minCadence?: number;
  maxCadence?: number;
  minElevation?: number;
  maxElevation?: number;
  minTemperature?: number;
  maxTemperature?: number;
  shoesId?: string;
  deviceId?: string;
  weatherSummary?: string;
  decisionSeverity?: 'info' | 'low' | 'medium' | 'high' | 'critical';
  dataQualityScore?: number;
}

export type SortField =
  | 'date'
  | 'distance'
  | 'duration'
  | 'speed'
  | 'pace'
  | 'heartRate'
  | 'power'
  | 'cadence'
  | 'elevation'
  | 'trainingLoad'
  | 'performanceScore'
  | 'alphabetical';

export type SortOrder = 'asc' | 'desc';

export interface PaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string | null;
}

export class AnalyticsQueryEngine {
  constructor(private context?: QueryContext) {}

  // Fetch athlete safely with fallback
  private async getAthlete(userId: string): Promise<CanonicalAthlete | null> {
    if (this.context?.athlete) return this.context.athlete;
    try {
      return await CanonicalRepository.getAthlete(userId, userId);
    } catch (e) {
      return null;
    }
  }

  // Fetch activities safely with fallback
  private async getActivities(userId: string): Promise<CanonicalActivity[]> {
    if (this.context?.activities) return this.context.activities;
    try {
      return await CanonicalRepository.listActivities(userId, 100) || [];
    } catch (e) {
      return [];
    }
  }

  // Fetch connections safely with fallback
  private async getConnections(userId: string): Promise<any[]> {
    if (this.context?.connections) return this.context.connections;
    try {
      return await ConnectionRepository.getConnections(userId) || [];
    } catch (e) {
      return [];
    }
  }

  // Fetch sync attempts safely with fallback
  private async getSyncHistory(userId: string): Promise<any[]> {
    if (this.context?.syncAttempts) return this.context.syncAttempts;
    try {
      // Fallback: if we have multiple connections, compile logs
      const conns = await this.getConnections(userId);
      const allHistory: any[] = [];
      for (const c of conns) {
        const history = await ConnectionRepository.getSyncHistory(userId, c.providerId);
        allHistory.push(...history);
      }
      return allHistory;
    } catch (e) {
      return [];
    }
  }

  // Retrieve metrics safely
  private getMetrics(): ComputedMetric[] {
    return this.context?.metrics || [];
  }

  // Retrieve decisions safely
  private getDecisions(): Decision[] {
    return this.context?.decisions || [];
  }

  // Dynamic metrics and decisions compiler
  private async computeMetricsAndDecisions(
    athleteId: string,
    athlete: CanonicalAthlete | null,
    activities: CanonicalActivity[]
  ): Promise<{ metrics: ComputedMetric[]; decisions: Decision[] }> {
    if (this.context?.metrics && this.context.metrics.length > 0) {
      return {
        metrics: this.context.metrics,
        decisions: this.context.decisions || []
      };
    }

    if (!athlete || activities.length === 0) {
      return { metrics: [], decisions: [] };
    }

    try {
      const { MetricEngine } = await import('@/lib/metrics/engine');
      const { DecisionEngine } = await import('@/lib/decision-engine/engine');

      const singleMetrics: ComputedMetric[] = [];
      for (const act of activities) {
        const computed = MetricEngine.evaluateActivity({
          activity: act,
          athlete
        });
        singleMetrics.push(...computed);
      }

      const trendMetrics = MetricEngine.evaluateAthleteHistory({
        history: activities,
        athlete
      });

      const metrics = [...singleMetrics, ...trendMetrics];

      const decisions = DecisionEngine.evaluate({
        athlete,
        metrics,
        history: activities
      });

      return { metrics, decisions };
    } catch (err) {
      console.error('[AnalyticsQueryEngine] Failed to dynamically compute metrics/decisions:', err);
      return { metrics: [], decisions: [] };
    }
  }

  /**
   * 1. Home Dashboard Query
   */
  public async queryHomeDashboard(
    athleteId: string,
    cachePolicyOverride?: 'memory' | 'session' | 'none'
  ): Promise<HomeDashboardViewModel> {
    const viewMeta = ViewRegistry.get('home_dashboard')!;
    const policy = cachePolicyOverride || viewMeta.cachePolicy;
    const cacheKey = AnalyticsCache.makeKey('home_dashboard', athleteId);

    const cached = AnalyticsCache.get<HomeDashboardViewModel>(cacheKey, policy);
    if (cached) return cached;

    const athlete = await this.getAthlete(athleteId);
    if (!athlete) throw new Error(`Athlete with ID ${athleteId} not found.`);

    const activities = await this.getActivities(athleteId);
    const { metrics, decisions } = await this.computeMetricsAndDecisions(athleteId, athlete, activities);
    const connections = await this.getConnections(athleteId);
    const syncAttempts = await this.getSyncHistory(athleteId);

    const model = HomeDashboardViewBuilder.build(
      athlete,
      activities,
      metrics,
      decisions,
      connections,
      syncAttempts
    );

    AnalyticsCache.set(cacheKey, model, policy, viewMeta.version);
    return model;
  }

  /**
   * 2. Performance Overview Query
   */
  public async queryPerformanceOverview(
    athleteId: string,
    cachePolicyOverride?: 'memory' | 'session' | 'none'
  ): Promise<PerformanceOverviewViewModel> {
    const viewMeta = ViewRegistry.get('performance_overview')!;
    const policy = cachePolicyOverride || viewMeta.cachePolicy;
    const cacheKey = AnalyticsCache.makeKey('performance_overview', athleteId);

    const cached = AnalyticsCache.get<PerformanceOverviewViewModel>(cacheKey, policy);
    if (cached) return cached;

    const athlete = await this.getAthlete(athleteId);
    const activities = await this.getActivities(athleteId);
    const { metrics, decisions } = await this.computeMetricsAndDecisions(athleteId, athlete, activities);

    const model = PerformanceOverviewViewBuilder.build(
      athleteId,
      activities,
      metrics,
      decisions
    );

    AnalyticsCache.set(cacheKey, model, policy, viewMeta.version);
    return model;
  }

  /**
   * 3. Activity Summary Query
   */
  public async queryActivitySummary(activityId: string): Promise<ActivitySummaryViewModel | null> {
    const contextActivities = this.context?.activities || [];
    const act = contextActivities.find(a => a.id === activityId);
    if (!act) return null;

    const decisions = this.getDecisions();
    return ActivitySummaryViewBuilder.build(act, decisions);
  }

  /**
   * 4. Activity Detail Query
   */
  public async queryActivityDetail(
    userId: string,
    activityId: string
  ): Promise<ActivityDetailViewModel | null> {
    let activity: CanonicalActivity | null = null;
    if (this.context?.activities) {
      activity = this.context.activities.find(a => a.id === activityId) || null;
    } else {
      try {
        activity = await CanonicalRepository.getActivity(userId, activityId);
      } catch (e) {
        activity = null;
      }
    }

    if (!activity) return null;

    const athlete = await this.getAthlete(userId);
    const activities = await this.getActivities(userId);
    const { metrics, decisions } = await this.computeMetricsAndDecisions(userId, athlete, activities);

    // Fetch related details
    let splits: CanonicalSplit[] = [];
    let laps: CanonicalLap[] = [];
    let stream: CanonicalStream | null = null;
    let gear: CanonicalGear | null = null;

    if (this.context) {
      splits = this.context.splits?.filter(s => s.activityId === activityId) || [];
      laps = this.context.laps?.filter(l => l.activityId === activityId) || [];
      stream = this.context.streams?.[activityId] || null;
      gear = this.context.gear?.find(g => g.id === activity?.shoesId) || null;
    } else {
      try {
        splits = await CanonicalRepository.listSplitsForActivity(userId, activityId, 'kilometer') || [];
        laps = await CanonicalRepository.listLapsForActivity(userId, activityId) || [];
        stream = await CanonicalRepository.getStream(userId, activityId);
        if (activity.shoesId) {
          gear = await CanonicalRepository.getGear(userId, activity.shoesId);
        }
      } catch (e) {
        // Safe fallbacks
      }
    }

    return ActivityDetailViewBuilder.build(
      activity,
      metrics,
      decisions,
      splits,
      laps,
      stream,
      gear
    );
  }

  /**
   * 5. Weekly Training Query
   */
  public async queryWeeklyTraining(
    athleteId: string,
    weekStart: string,
    weekEnd: string
  ): Promise<WeeklyTrainingViewModel> {
    const athlete = await this.getAthlete(athleteId);
    const activities = await this.getActivities(athleteId);
    const filtered = activities.filter(a => {
      const d = new Date(a.startDate);
      return d >= new Date(weekStart) && d <= new Date(weekEnd);
    });

    const { metrics, decisions } = await this.computeMetricsAndDecisions(athleteId, athlete, activities);

    return WeeklyTrainingViewBuilder.build(
      athleteId,
      weekStart,
      weekEnd,
      filtered,
      metrics,
      decisions
    );
  }

  /**
   * 6. Monthly Training Query
   */
  public async queryMonthlyTraining(
    athleteId: string,
    monthString: string
  ): Promise<MonthlyTrainingViewModel> {
    const athlete = await this.getAthlete(athleteId);
    const activities = await this.getActivities(athleteId);
    const filtered = activities.filter(a => a.startDate.startsWith(monthString));
    const { decisions } = await this.computeMetricsAndDecisions(athleteId, athlete, activities);

    return MonthlyTrainingViewBuilder.build(
      athleteId,
      monthString,
      filtered,
      decisions
    );
  }

  /**
   * 7. Heart Rate Overview Query
   */
  public async queryHeartRateOverview(athleteId: string): Promise<HeartRateOverviewViewModel> {
    const athlete = await this.getAthlete(athleteId);
    const restingHr = athlete?.restingHeartRateBpm ?? 60;
    const maxHr = athlete?.maxHeartRateBpm ?? 190;

    const activities = await this.getActivities(athleteId);
    const { metrics } = await this.computeMetricsAndDecisions(athleteId, athlete, activities);

    return HeartRateOverviewViewBuilder.build(
      athleteId,
      restingHr,
      maxHr,
      activities,
      metrics
    );
  }

  /**
   * 8. Power Overview Query
   */
  public async queryPowerOverview(athleteId: string): Promise<PowerOverviewViewModel> {
    const athlete = await this.getAthlete(athleteId);
    const ftp = athlete?.ftpWatts ?? 250;
    const activities = await this.getActivities(athleteId);
    const { metrics } = await this.computeMetricsAndDecisions(athleteId, athlete, activities);

    return PowerOverviewViewBuilder.build(athleteId, ftp, metrics);
  }

  /**
   * 9. Cadence Overview Query
   */
  public async queryCadenceOverview(athleteId: string): Promise<CadenceOverviewViewModel> {
    const activities = await this.getActivities(athleteId);
    return CadenceOverviewViewBuilder.build(athleteId, activities);
  }

  /**
   * 10. Training Load Overview Query
   */
  public async queryTrainingLoadOverview(athleteId: string): Promise<TrainingLoadOverviewViewModel> {
    const athlete = await this.getAthlete(athleteId);
    const activities = await this.getActivities(athleteId);
    const { metrics } = await this.computeMetricsAndDecisions(athleteId, athlete, activities);
    return TrainingLoadOverviewViewBuilder.build(athleteId, metrics);
  }

  /**
   * 11. Recovery Overview Query
   */
  public async queryRecoveryOverview(athleteId: string): Promise<RecoveryOverviewViewModel> {
    const athlete = await this.getAthlete(athleteId);
    const activities = await this.getActivities(athleteId);
    const { metrics } = await this.computeMetricsAndDecisions(athleteId, athlete, activities);
    return RecoveryOverviewViewBuilder.build(athleteId, metrics);
  }

  /**
   * 12. Environment Overview Query
   */
  public async queryEnvironmentOverview(athleteId: string): Promise<EnvironmentOverviewViewModel> {
    const activities = await this.getActivities(athleteId);
    return EnvironmentOverviewViewBuilder.build(athleteId, activities);
  }

  /**
   * 13. Equipment Overview Query
   */
  public async queryEquipmentOverview(athleteId: string): Promise<EquipmentOverviewViewModel> {
    const gearList = this.context?.gear || [];
    return EquipmentOverviewViewBuilder.build(athleteId, gearList);
  }

  /**
   * 14. Sync Health Query
   */
  public async querySyncHealth(athleteId: string): Promise<SyncHealthViewModel> {
    const connections = await this.getConnections(athleteId);
    const attempts = await this.getSyncHistory(athleteId);
    return SyncHealthViewBuilder.build(athleteId, connections, attempts);
  }

  /**
   * 15. Data Health Query
   */
  public async queryDataHealth(athleteId: string): Promise<DataHealthViewModel> {
    const athlete = await this.getAthlete(athleteId);
    const activities = await this.getActivities(athleteId);
    const { metrics } = await this.computeMetricsAndDecisions(athleteId, athlete, activities);
    return DataHealthViewBuilder.build(athleteId, activities, metrics);
  }

  /**
   * 16. Search Query (Filtering, Sorting & Pagination Integration)
   */
  public async querySearchResult(
    athleteId: string,
    queryText: string,
    filters?: FilterParams,
    sorting?: { field: SortField; order?: SortOrder },
    pagination?: PaginationParams
  ): Promise<SearchResultViewModel> {
    let activities = await this.getActivities(athleteId);
    let gear = this.context?.gear || [];
    let routes = this.context?.routes || [];

    // Apply text search keyword
    const keyword = queryText.toLowerCase().trim();
    if (keyword) {
      activities = activities.filter(
        a => a.activityName.toLowerCase().includes(keyword) || 
             a.location.city?.toLowerCase().includes(keyword) ||
             a.location.state?.toLowerCase().includes(keyword)
      );
      gear = gear.filter(
        g => g.name.toLowerCase().includes(keyword) || 
             g.brandName?.toLowerCase().includes(keyword) ||
             g.modelName?.toLowerCase().includes(keyword)
      );
      routes = routes.filter(
        r => r.name.toLowerCase().includes(keyword) || 
             r.description?.toLowerCase().includes(keyword)
      );
    }

    // Apply Filter Engine
    if (filters) {
      activities = activities.filter(act => {
        if (filters.startDate && new Date(act.startDate) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(act.startDate) > new Date(filters.endDate)) return false;
        if (filters.sportType && act.sportType !== filters.sportType) return false;
        if (filters.minDistance !== undefined && act.distanceMeters < filters.minDistance) return false;
        if (filters.maxDistance !== undefined && act.distanceMeters > filters.maxDistance) return false;
        if (filters.minDuration !== undefined && act.movingTimeSec < filters.minDuration) return false;
        if (filters.maxDuration !== undefined && act.movingTimeSec > filters.maxDuration) return false;
        if (filters.minPace !== undefined && act.averagePaceMinPerKm < filters.minPace) return false;
        if (filters.maxPace !== undefined && act.averagePaceMinPerKm > filters.maxPace) return false;
        if (filters.minSpeed !== undefined && act.averageSpeedMps < filters.minSpeed) return false;
        if (filters.maxSpeed !== undefined && act.averageSpeedMps > filters.maxSpeed) return false;
        if (filters.minHeartRate !== undefined && (act.averageHeartRateBpm ?? 0) < filters.minHeartRate) return false;
        if (filters.maxHeartRate !== undefined && (act.averageHeartRateBpm ?? 0) > filters.maxHeartRate) return false;
        if (filters.minPower !== undefined && (act.averagePowerWatts ?? 0) < filters.minPower) return false;
        if (filters.maxPower !== undefined && (act.averagePowerWatts ?? 0) > filters.maxPower) return false;
        if (filters.minCadence !== undefined && (act.averageCadenceRpm ?? 0) < filters.minCadence) return false;
        if (filters.maxCadence !== undefined && (act.averageCadenceRpm ?? 0) > filters.maxCadence) return false;
        if (filters.minElevation !== undefined && act.elevationGainMeters < filters.minElevation) return false;
        if (filters.maxElevation !== undefined && act.elevationGainMeters > filters.maxElevation) return false;
        if (filters.shoesId && act.shoesId !== filters.shoesId) return false;
        return true;
      });
    }

    // Apply Sort Engine
    if (sorting) {
      const field = sorting.field;
      const order = sorting.order || 'desc';
      activities.sort((a, b) => {
        let valA: any = 0;
        let valB: any = 0;
        switch (field) {
          case 'date':
            valA = new Date(a.startDate).getTime();
            valB = new Date(b.startDate).getTime();
            break;
          case 'distance':
            valA = a.distanceMeters;
            valB = b.distanceMeters;
            break;
          case 'duration':
            valA = a.movingTimeSec;
            valB = b.movingTimeSec;
            break;
          case 'speed':
            valA = a.averageSpeedMps;
            valB = b.averageSpeedMps;
            break;
          case 'elevation':
            valA = a.elevationGainMeters;
            valB = b.elevationGainMeters;
            break;
          case 'alphabetical':
            valA = a.activityName.toLowerCase();
            valB = b.activityName.toLowerCase();
            break;
          default:
            valA = new Date(a.startDate).getTime();
            valB = new Date(b.startDate).getTime();
        }
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const offset = pagination?.offset ?? 0;
    const limit = pagination?.limit ?? 20;

    return SearchResultViewBuilder.build(
      queryText,
      activities,
      gear,
      routes,
      offset,
      limit
    );
  }

  /**
   * 17. Compare Query
   */
  public async queryCompare(
    athleteId: string,
    baseActivityId: string,
    targetActivityId: string
  ): Promise<CompareViewModel> {
    const baseDetail = await this.queryActivityDetail(athleteId, baseActivityId);
    const targetDetail = await this.queryActivityDetail(athleteId, targetActivityId);

    if (!baseDetail || !targetDetail) {
      throw new Error(`One or both activities (${baseActivityId}, ${targetActivityId}) could not be retrieved.`);
    }

    return CompareViewBuilder.build(athleteId, baseDetail, targetDetail);
  }

  /**
   * 18. Timeline Query
   */
  public async queryTimeline(
    athleteId: string,
    pagination?: PaginationParams
  ): Promise<TimelineViewModel> {
    const activities = await this.getActivities(athleteId);
    return TimelineViewBuilder.build(athleteId, activities);
  }

  /**
   * 19. Athlete Profile Query
   */
  public async queryAthleteProfile(
    userId: string,
    athleteId: string
  ): Promise<AthleteProfileViewModel> {
    const athlete = await this.getAthlete(athleteId);
    if (!athlete) throw new Error(`Athlete Profile for ${athleteId} not found.`);

    const metrics = this.getMetrics();
    return AthleteProfileViewBuilder.build(athlete, metrics);
  }

  /**
   * 20. Settings Query
   */
  public async querySettings(athleteId: string): Promise<SettingsViewModel> {
    return SettingsViewBuilder.build(athleteId);
  }
}
