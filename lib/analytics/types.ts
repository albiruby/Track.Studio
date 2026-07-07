import { CanonicalAthlete, CanonicalActivity, CanonicalGear, CanonicalRoute, CanonicalSplit, CanonicalLap } from '@/lib/data-platform/canonical/types';
import { ComputedMetric } from '@/lib/metrics/types';
import { Decision } from '@/lib/decision-engine/types';

export interface ViewModelTraceability {
  canonicalIds: string[];
  metricIds: string[];
  decisionIds: string[];
  syncIds: string[];
  repositoryVersions: {
    canonical: string;
    metrics: string;
    decisions: string;
    connections?: string;
  };
  viewVersion: string;
  timestamp: string; // ISO string
}

export interface HomeDashboardViewModel {
  athlete: CanonicalAthlete;
  latestActivity: CanonicalActivity | null;
  recentActivities: CanonicalActivity[];
  weeklySummary: {
    distanceMeters: number;
    durationSec: number;
    activityCount: number;
    elevationGainMeters: number;
    rssSum?: number;
  };
  monthlySummary: {
    distanceMeters: number;
    durationSec: number;
    activityCount: number;
    elevationGainMeters: number;
    rssSum?: number;
  };
  currentCTL: number | null;
  currentATL: number | null;
  currentTSB: number | null;
  currentLoadStatus: string | null;
  currentRecoveryStatus: string | null;
  currentPerformanceStatus: string | null;
  currentDataQuality: { score: number; status: string } | null;
  syncStatus: {
    providerId: string;
    lastSuccessfulSync: string | null;
    status: 'healthy' | 'degraded' | 'failing';
  } | null;
  recentDecisions: Decision[];
  latestAlerts: {
    decisionId: string;
    category: string;
    message: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  }[];
  personalBestHighlights: {
    effortName: string;
    value: number;
    formattedValue: string;
    date: string;
  }[];
  equipmentSummary: {
    totalShoes: number;
    activeShoes: number;
    needsRetirement: string[];
  };
  connectionSummary: {
    activeConnections: string[];
    pendingSyncCount: number;
  };
  traceability: ViewModelTraceability;
}

export interface PerformanceOverviewViewModel {
  athleteId: string;
  fitness: {
    currentCTL: number;
    trend: 'rising' | 'stable' | 'declining';
    history: { date: string; value: number }[];
  };
  fatigue: {
    currentATL: number;
    trend: 'rising' | 'stable' | 'declining';
    history: { date: string; value: number }[];
  };
  form: {
    currentTSB: number;
    status: string;
    history: { date: string; value: number }[];
  };
  performanceTrend: {
    trendStatus: string;
    description: string;
    scoreTrend: { date: string; score: number }[];
  };
  bestEfforts: {
    name: string;
    value: number;
    date: string;
    activityName: string;
    activityId: string;
  }[];
  seasonBest: {
    name: string;
    value: number;
    date: string;
    activityName: string;
    activityId: string;
  }[];
  weeklyProgress: {
    weekStart: string;
    distanceMeters: number;
    durationSec: number;
    count: number;
  }[];
  monthlyProgress: {
    month: string;
    distanceMeters: number;
    durationSec: number;
    count: number;
  }[];
  consistency: {
    workoutCountLast30Days: number;
    uniformityIndex: number;
    trainingMonotony: number;
    riskStatus: string;
  };
  runningEconomy: {
    currentVo2Max: number | null;
    aeroclassDescription: string;
  };
  efficiency: {
    efficiencyFactorTrend: { date: string; value: number }[];
  };
  traceability: ViewModelTraceability;
}

export interface ActivitySummaryViewModel {
  activityId: string;
  activityName: string;
  startDate: string;
  sportType: string;
  distanceMeters: number;
  movingTimeSec: number;
  elapsedTimeSec: number;
  averagePaceDecimal: number;
  averageHeartRate: number | null;
  averagePower: number | null;
  elevationGain: number;
  primaryDecision: {
    status: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    explanationCode: string;
  } | null;
  qualityScore: number | null;
  traceability: ViewModelTraceability;
}

export interface ActivityDetailViewModel {
  activity: CanonicalActivity;
  metrics: ComputedMetric[];
  decisions: Decision[];
  sensorQuality: {
    overallScore: number;
    heartRateCoverage: number;
    gpsCoverage: number;
    powerCoverage: number;
    status: string;
  };
  environmentalSummary: {
    temperatureC: number | null;
    humidityPercent: number | null;
    heatStressIndex: string;
    description: string;
  };
  equipmentUsed: CanonicalGear | null;
  splits: CanonicalSplit[];
  laps: CanonicalLap[];
  streamsMetadata: {
    availableStreams: string[];
    dataPointsCount: number;
    sampleRateHz: number;
  };
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  relatedActivities: {
    activityId: string;
    name: string;
    distanceMeters: number;
    startDate: string;
  }[];
  traceability: ViewModelTraceability;
}

export interface WeeklyTrainingViewModel {
  athleteId: string;
  weekStartDate: string;
  weekEndDate: string;
  totalDistanceMeters: number;
  totalDurationSec: number;
  totalElevationGain: number;
  activities: ActivitySummaryViewModel[];
  loadSummary: {
    rssSum: number;
    relativeRamp: number;
    strainRisk: string;
  };
  dailyDistribution: {
    dayOfWeek: string;
    date: string;
    distanceMeters: number;
    durationSec: number;
    rss: number | null;
  }[];
  traceability: ViewModelTraceability;
}

export interface MonthlyTrainingViewModel {
  athleteId: string;
  monthString: string; // "YYYY-MM"
  totalDistanceMeters: number;
  totalDurationSec: number;
  totalElevationGain: number;
  activitiesCount: number;
  weeklyBreakdowns: {
    weekNumber: number;
    distanceMeters: number;
    durationSec: number;
    activityCount: number;
  }[];
  decisionsHistory: Decision[];
  traceability: ViewModelTraceability;
}

export interface HeartRateOverviewViewModel {
  athleteId: string;
  restingHeartRate: number | null;
  maxHeartRate: number | null;
  aerobicDecouplingAvg: number | null;
  cardiovascularDriftHistory: {
    date: string;
    value: number;
    activityId?: string;
  }[];
  aerobicThresholdBpm: number | null;
  zoneDistribution: {
    zoneName: string;
    timeInZoneSec: number;
    percentage: number;
  }[];
  hrEfficiencyTrend: {
    date: string;
    efficiencyFactor: number;
  }[];
  traceability: ViewModelTraceability;
}

export interface PowerOverviewViewModel {
  athleteId: string;
  ftpWatts: number | null;
  variabilityIndexAvg: number | null;
  powerCurve: {
    durationSec: number;
    watts: number;
    wattsPerKg: number;
    date: string;
  }[];
  powerZoneDistribution: {
    zoneName: string;
    timeInZoneSec: number;
    percentage: number;
  }[];
  mechanicalEfficiencyScore: number | null;
  traceability: ViewModelTraceability;
}

export interface CadenceOverviewViewModel {
  athleteId: string;
  averageCadence: number;
  maxCadence: number;
  cadenceStabilityTrend: {
    date: string;
    stabilityIndex: number;
    averageCadence: number;
  }[];
  strideEfficiencyClassification: string;
  fatigueInducedDecayRate: number;
  traceability: ViewModelTraceability;
}

export interface TrainingLoadOverviewViewModel {
  athleteId: string;
  ctlTrend: { date: string; value: number }[];
  atlTrend: { date: string; value: number }[];
  rampRateTrend: { date: string; value: number }[];
  weeklyProgress: {
    date: string;
    loadPoints: number;
    isWithinLimits: boolean;
  }[];
  trainingStrainSummary: {
    currentStrain: number;
    threshold: number;
    classification: string;
  };
  traceability: ViewModelTraceability;
}

export interface RecoveryOverviewViewModel {
  athleteId: string;
  tsbTrend: { date: string; value: number }[];
  currentTSB: number;
  recoveryStatus: string;
  readinessScore: number;
  monotonyIndex: number;
  recommendedIntensityLimit: string;
  traceability: ViewModelTraceability;
}

export interface EnvironmentOverviewViewModel {
  athleteId: string;
  extremeWeatherCount: number;
  heatAcclimatizationScore: number;
  temperatureImpactTrend: {
    date: string;
    temperatureC: number;
    averageHeartRate: number;
    relativePace: number;
  }[];
  comfortableRunsPercentage: number;
  traceability: ViewModelTraceability;
}

export interface EquipmentOverviewViewModel {
  athleteId: string;
  shoes: {
    gearId: string;
    name: string;
    brand: string | null;
    model: string | null;
    distanceMeters: number;
    mileageLimitMeters: number;
    percentageUsed: number;
    needsReplacement: boolean;
    retired: boolean;
    addedDate: string;
  }[];
  injuryRiskAssessment: {
    gearId: string;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
  traceability: ViewModelTraceability;
}

export interface SyncHealthViewModel {
  athleteId: string;
  providers: {
    providerId: string;
    status: 'active' | 'degraded' | 'failed';
    lastSyncTime: string | null;
    totalSyncs: number;
    successCount: number;
    errorCount: number;
    syncHistory: { id: string; timestamp: string; success: boolean; message: string | null }[];
  }[];
  overallSystemHealth: string;
  traceability: ViewModelTraceability;
}

export interface DataHealthViewModel {
  athleteId: string;
  overallIntegrityScore: number;
  sensorCoverage: {
    heartRateCount: number;
    powerCount: number;
    cadenceCount: number;
    totalActivities: number;
  };
  anomalyLogs: {
    date: string;
    activityId: string;
    issueType: string;
    severity: string;
  }[];
  traceability: ViewModelTraceability;
}

export interface SearchResultViewModel {
  query: string;
  activities: ActivitySummaryViewModel[];
  shoes: CanonicalGear[];
  routes: CanonicalRoute[];
  totalCount: number;
  pagination: {
    cursor: string | null;
    offset: number;
    limit: number;
    total: number;
  };
  traceability: ViewModelTraceability;
}

export interface CompareViewModel {
  athleteId: string;
  baseActivity: ActivityDetailViewModel;
  targetActivity: ActivityDetailViewModel;
  metricsDifference: {
    metricId: string;
    metricName: string;
    baseValue: any;
    targetValue: any;
    absoluteDiff: number | null;
    percentageDiff: number | null;
  }[];
  pacingComparison: {
    splitIndex: number;
    baseSpeed: number;
    targetSpeed: number;
    speedDifference: number;
  }[];
  traceability: ViewModelTraceability;
}

export interface TimelineViewModel {
  athleteId: string;
  events: {
    id: string;
    date: string;
    type: 'activity' | 'milestone' | 'gear_change' | 'sync_health';
    title: string;
    description: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    referenceId: string;
  }[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
  };
  traceability: ViewModelTraceability;
}

export interface AthleteProfileViewModel {
  athlete: CanonicalAthlete;
  currentStatusSummary: {
    ctl: number | null;
    atl: number | null;
    tsb: number | null;
    restingHeartRate: number | null;
    maxHeartRate: number | null;
    ftp: number | null;
    vo2Max: number | null;
  };
  systemCredentials: {
    providerId: string;
    configured: boolean;
    scopes: string[];
  }[];
  traceability: ViewModelTraceability;
}

export interface SettingsViewModel {
  athleteId: string;
  thresholds: {
    tsbFormZones: Record<string, [number, number]>;
    weeklyRampLimits: [number, number];
    cardiacDriftCriticalLimit: number;
    gearMileageReplacementLimitMeters: number;
  };
  syncPreferences: {
    autoSyncEnabled: boolean;
    notificationPreferences: string[];
  };
  traceability: ViewModelTraceability;
}

export interface ViewRegistryEntry {
  viewId: string;
  viewName: string;
  category: string;
  dependencies: string[];
  repositoriesUsed: string[];
  cachePolicy: 'memory' | 'session' | 'none';
  refreshPolicy: 'lazy' | 'eager';
  version: string;
  status: 'active' | 'deprecated' | 'experimental';
  documentationLink: string;
}
