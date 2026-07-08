/**
 * Track.Studio — Widget Library ViewModel Contracts
 * Explicit TypeScript contracts for widget input ViewModels.
 */

export interface HomeProfileViewModel {
  id: string;
  name: string;
  email: string;
  gender: string;
  weightKg: number;
  restingHr: number;
  maxHr: number;
  ftpWatts: number;
  vo2max: number;
  avatarUrl: string;
  calculatedThresholds: {
    restingPace: string;
    aerobicThresholdPace: string;
    lactateThresholdPace: string;
  };
}

export interface RecentActivityViewModel {
  id: string;
  title: string;
  sportType: 'run' | 'ride' | 'swim' | 'other';
  distanceMeters: number;
  durationSeconds: number;
  averageHeartRate: number;
  maxHeartRate: number;
  averagePace: string;
  runningStressScore: number;
  intensityFactor: number;
  efficiencyFactor: number;
  aerobicDecoupling: number | null;
  source: 'strava' | 'intervals';
  timestamp: string;
  isCalibrated: boolean;
}

export interface WeeklySummaryViewModel {
  currentWeekDistanceKm: number;
  currentWeekDurationMinutes: number;
  currentWeekRss: number;
  targetDistanceKm: number;
  targetRss: number;
  variancePercent: number;
  dailyBreakdown: {
    day: string;
    distanceKm: number;
    rss: number;
  }[];
}

export interface PerformanceMetricsViewModel {
  currentCtl: number;
  currentAtl: number;
  currentTsb: number;
  ctlRampRate: number;
  overtrainingRisk: 'low' | 'moderate' | 'high' | 'critical';
  peakingState: 'peaking' | 'optimal' | 'transitional' | 'overreaching' | 'recovery';
}

export interface PerformanceTrendViewModel {
  date: string;
  ctl: number;
  atl: number;
  tsb: number;
}

export interface ActivityListViewModel {
  activities: {
    id: string;
    title: string;
    date: string;
    distanceKm: number;
    duration: string;
    pace: string;
    rss: number;
    status: 'synced' | 'pending' | 'corrupt';
  }[];
}

export interface WidgetContracts {
  home_profile: HomeProfileViewModel;
  home_recent_activity: RecentActivityViewModel;
  home_weekly_summary: WeeklySummaryViewModel;
  home_performance_metrics: PerformanceMetricsViewModel;
  perf_fitness_fatigue: PerformanceTrendViewModel[];
  act_list_view: ActivityListViewModel;
}
