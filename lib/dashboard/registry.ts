import { DashboardRegistryEntry, WidgetRegistryEntry } from '@/types/dashboard';

/**
 * Registry of all 15 Track.Studio dashboards as per Phase 11 requirements
 */
export const DASHBOARD_REGISTRY: Record<string, DashboardRegistryEntry> = {
  dashboard: {
    id: 'dashboard',
    name: 'Home Dashboard',
    category: 'Core Workspace',
    supportedViewModels: ['HomeDashboardViewModel'],
    supportedWidgets: ['home_profile', 'home_recent_activity', 'home_weekly_summary', 'home_performance_metrics'],
    layoutTemplate: 'bento',
    version: '1.0.0',
    status: 'active',
    documentation: 'Central overview of athlete profile, recent training activities, weekly summary, and system-wide synchronization health.'
  },
  performance: {
    id: 'performance',
    name: 'Performance Dashboard',
    category: 'Analytics Engine',
    supportedViewModels: ['PerformanceOverviewViewModel'],
    supportedWidgets: ['perf_fitness_fatigue', 'perf_form_balance', 'perf_season_bests', 'perf_running_economy'],
    layoutTemplate: 'grid',
    version: '1.0.0',
    status: 'active',
    documentation: 'In-depth analysis of athletic trends including chronic training load, performance status, consistency rating, and VO2max economy.'
  },
  activities: {
    id: 'activities',
    name: 'Activities Dashboard',
    category: 'Core Workspace',
    supportedViewModels: ['ActivitySummaryViewModel', 'ActivityDetailViewModel'],
    supportedWidgets: ['act_list_view', 'act_stats_aggregation', 'act_quality_scores'],
    layoutTemplate: 'split',
    version: '1.0.0',
    status: 'active',
    documentation: 'Examines individual synchronized activities, including split paces, environmental indices, and raw data stream quality logs.'
  },
  heart_rate: {
    id: 'heart_rate',
    name: 'Heart Rate Dashboard',
    category: 'Sensor Insights',
    supportedViewModels: ['HeartRateOverviewViewModel'],
    supportedWidgets: ['hr_distribution', 'hr_drift_coupling', 'hr_efficiency'],
    layoutTemplate: 'grid',
    version: '1.0.0',
    status: 'active',
    documentation: 'Provides details on resting and maximum heart rate, aerobic decoupling, cardiovascular drift, and cardiac efficiency trends.'
  },
  power: {
    id: 'power',
    name: 'Power Dashboard',
    category: 'Sensor Insights',
    supportedViewModels: ['PowerOverviewViewModel'],
    supportedWidgets: ['power_curve', 'power_zones', 'power_efficiency'],
    layoutTemplate: 'grid',
    version: '1.0.0',
    status: 'experimental',
    documentation: 'Monitors cycling/running FTP thresholds, Power Duration curves, power zone distribution, and mechanical efficiency metrics.'
  },
  cadence: {
    id: 'cadence',
    name: 'Cadence Dashboard',
    category: 'Sensor Insights',
    supportedViewModels: ['CadenceOverviewViewModel'],
    supportedWidgets: ['cadence_stability', 'cadence_decay'],
    layoutTemplate: 'grid',
    version: '1.0.0',
    status: 'experimental',
    documentation: 'Evaluates stride cadence variance, maximum cadence, stride efficiency, and decay rates induced by aerobic fatigue.'
  },
  training_load: {
    id: 'training_load',
    name: 'Training Load Dashboard',
    category: 'Analytics Engine',
    supportedViewModels: ['TrainingLoadOverviewViewModel'],
    supportedWidgets: ['load_ctl_trend', 'load_ramp_rate'],
    layoutTemplate: 'bento',
    version: '1.0.0',
    status: 'active',
    documentation: 'Calculates chronic load, acute load, and weekly ramp rates, evaluating whether volume adjustments fall within safe structural limits.'
  },
  recovery: {
    id: 'recovery',
    name: 'Recovery Dashboard',
    category: 'Analytics Engine',
    supportedViewModels: ['RecoveryOverviewViewModel'],
    supportedWidgets: ['rec_readiness', 'rec_monotony'],
    layoutTemplate: 'grid',
    version: '1.0.0',
    status: 'active',
    documentation: 'Synthesizes daily training stress balance (TSB) form, training monotony, readiness indices, and safety recommendation caps.'
  },
  environment: {
    id: 'environment',
    name: 'Environment Dashboard',
    category: 'Environment & Gear',
    supportedViewModels: ['EnvironmentOverviewViewModel'],
    supportedWidgets: ['env_heat_acclimation', 'env_impact_pace'],
    layoutTemplate: 'grid',
    version: '1.0.0',
    status: 'experimental',
    documentation: 'Analyzes extreme weather training sessions, relative temperature impacts, and thermal-stress cardiac decoupling scores.'
  },
  equipment: {
    id: 'equipment',
    name: 'Equipment Dashboard',
    category: 'Environment & Gear',
    supportedViewModels: ['EquipmentOverviewViewModel'],
    supportedWidgets: ['eq_shoe_mileage', 'eq_injury_assessment'],
    layoutTemplate: 'grid',
    version: '1.0.0',
    status: 'active',
    documentation: 'Lists active and retired gear, cumulative running shoes mileage totals, and alerts when replacement thresholds are exceeded.'
  },
  connections: {
    id: 'connections',
    name: 'Connections Dashboard',
    category: 'System Administration',
    supportedViewModels: ['SyncHealthViewModel'],
    supportedWidgets: ['conn_strava', 'conn_intervals'],
    layoutTemplate: 'connections',
    version: '1.0.0',
    status: 'active',
    documentation: 'Monitors external OAuth integrations, API synchronization histories, error rates, and direct webhook subscription ports.'
  },
  data_health: {
    id: 'data_health',
    name: 'Data Health Dashboard',
    category: 'System Administration',
    supportedViewModels: ['DataHealthViewModel'],
    supportedWidgets: ['health_integrity', 'health_anomaly_logs'],
    layoutTemplate: 'grid',
    version: '1.0.0',
    status: 'active',
    documentation: 'Analyzes raw telemetry integrity, identifying missing GPS coordinates, heart rate sensor dropping events, or cadence gaps.'
  },
  settings: {
    id: 'settings',
    name: 'Settings Dashboard',
    category: 'System Administration',
    supportedViewModels: ['SettingsViewModel'],
    supportedWidgets: ['set_thresholds', 'set_sync_prefs'],
    layoutTemplate: 'vertical',
    version: '1.0.0',
    status: 'active',
    documentation: 'Calibrates physiology and system settings, including heart rate/power zones, auto-sync parameters, and metric preferences.'
  },
  search: {
    id: 'search',
    name: 'Search Dashboard',
    category: 'Analytics Engine',
    supportedViewModels: ['SearchResultViewModel'],
    supportedWidgets: ['search_query_input', 'search_results_grid'],
    layoutTemplate: 'vertical',
    version: '1.0.0',
    status: 'active',
    documentation: 'Enables advanced structured database queries across activities, route paths, specific gears, or temporal parameters.'
  },
  compare: {
    id: 'compare',
    name: 'Compare Dashboard',
    category: 'Analytics Engine',
    supportedViewModels: ['CompareViewModel'],
    supportedWidgets: ['comp_activity_selector', 'comp_delta_matrix'],
    layoutTemplate: 'split',
    version: '1.0.0',
    status: 'active',
    documentation: 'Performs direct dual-activity comparative pacing overlay, cardiac decoupling alignment, and key metric delta calculations.'
  }
};

/**
 * Registry of all supporting widgets
 */
export const WIDGET_REGISTRY: Record<string, WidgetRegistryEntry> = {
  // Home widgets
  home_profile: {
    id: 'home_profile',
    name: 'Athlete Profile Context',
    description: 'Displays basic physiological capacities, weight metrics, and active athlete records.',
    defaultWidth: 2,
    defaultHeight: 1
  },
  home_recent_activity: {
    id: 'home_recent_activity',
    name: 'Recent Ingested Activity',
    description: 'Provides deep dive summaries on the most recently imported training feed webhook.',
    defaultWidth: 2,
    defaultHeight: 2
  },
  home_weekly_summary: {
    id: 'home_weekly_summary',
    name: 'Weekly Training Volume Breakdown',
    description: 'Calculates the cumulative distance and duration totals for the active training week.',
    defaultWidth: 2,
    defaultHeight: 1
  },
  home_performance_metrics: {
    id: 'home_performance_metrics',
    name: 'Performance Load Matrix',
    description: 'A summary matrix indicating fitness CTL, fatigue ATL, and form TSB balances.',
    defaultWidth: 4,
    defaultHeight: 2
  },

  // Performance widgets
  perf_fitness_fatigue: {
    id: 'perf_fitness_fatigue',
    name: 'Fitness & Fatigue Trends',
    description: 'Monitors athletic volume growth trends and cumulative fatigue levels.',
    defaultWidth: 4,
    defaultHeight: 2
  },
  perf_form_balance: {
    id: 'perf_form_balance',
    name: 'Form & Recovery Balance',
    description: 'Tracks the training stress balance trajectory to map peaking cycles.',
    defaultWidth: 2,
    defaultHeight: 2
  },
  perf_season_bests: {
    id: 'perf_season_bests',
    name: 'Personal and Season Bests',
    description: 'Tracks top paced achievements across standardized running intervals.',
    defaultWidth: 2,
    defaultHeight: 1
  },
  perf_running_economy: {
    id: 'perf_running_economy',
    name: 'VO2max Running Economy',
    description: 'Tracks aerobic thresholds and oxygen utilization efficiency ratings.',
    defaultWidth: 2,
    defaultHeight: 1
  },

  // Activities widgets
  act_list_view: {
    id: 'act_list_view',
    name: 'Activity Index Directory',
    description: 'A structural collection of all synchronized runs with status sorting.',
    defaultWidth: 4,
    defaultHeight: 2
  },
  act_stats_aggregation: {
    id: 'act_stats_aggregation',
    name: 'Monthly Aggregate Achievements',
    description: 'Summarizes training counts and volume progress for the calendar month.',
    defaultWidth: 2,
    defaultHeight: 1
  },
  act_quality_scores: {
    id: 'act_quality_scores',
    name: 'Signal Integrity and Noise Scores',
    description: 'Rates GPS, HR, and Power signal coverage consistency.',
    defaultWidth: 2,
    defaultHeight: 1
  },

  // Heart Rate widgets
  hr_distribution: {
    id: 'hr_distribution',
    name: 'Heart Rate Zone Distribution',
    description: 'Measures time accumulated inside physiological heart rate zones.',
    defaultWidth: 2,
    defaultHeight: 2
  },
  hr_drift_coupling: {
    id: 'hr_drift_coupling',
    name: 'Cardiac Drift & Aerobic Decoupling',
    description: 'Measures cardiac cost and pace-to-heart-rate divergence ratios.',
    defaultWidth: 2,
    defaultHeight: 1
  },
  hr_efficiency: {
    id: 'hr_efficiency',
    name: 'Heart Rate Efficiency Coefficient',
    description: 'Calculates the ratio of average speed to average heart rate BPM.',
    defaultWidth: 2,
    defaultHeight: 1
  },

  // Power widgets
  power_curve: {
    id: 'power_curve',
    name: 'Power Duration Curve',
    description: 'Plots the maximum wattage output achieved across logarithmic durations.',
    defaultWidth: 4,
    defaultHeight: 2
  },
  power_zones: {
    id: 'power_zones',
    name: 'Power Intensity Distribution',
    description: 'Calculates training time spent inside customized wattage thresholds.',
    defaultWidth: 2,
    defaultHeight: 2
  },
  power_efficiency: {
    id: 'power_efficiency',
    name: 'Mechanical Efficiency Index',
    description: 'Measures wattage output vs cardiovascular heart rate expense.',
    defaultWidth: 2,
    defaultHeight: 1
  },

  // Cadence widgets
  cadence_stability: {
    id: 'cadence_stability',
    name: 'Stride Cadence Stability Rate',
    description: 'Tracks variance and cadence consistency indices throughout training runs.',
    defaultWidth: 2,
    defaultHeight: 2
  },
  cadence_decay: {
    id: 'cadence_decay',
    name: 'Fatigue-Induced Cadence Decay',
    description: 'Rates how much stride cadence drops during long threshold efforts.',
    defaultWidth: 2,
    defaultHeight: 1
  },

  // Training Load widgets
  load_ctl_trend: {
    id: 'load_ctl_trend',
    name: 'Chronic Training Load Trajectory',
    description: 'Calculates long-term fitness and workload adaptation velocity.',
    defaultWidth: 4,
    defaultHeight: 2
  },
  load_ramp_rate: {
    id: 'load_ramp_rate',
    name: 'Ramp Rate Risk Indicator',
    description: 'Alerts when week-over-week training stress escalation exceeds limits.',
    defaultWidth: 2,
    defaultHeight: 2
  },

  // Recovery widgets
  rec_readiness: {
    id: 'rec_readiness',
    name: 'Physiological Readiness Score',
    description: 'Scores readiness factors based on HRV, TSB, and recent training stress.',
    defaultWidth: 2,
    defaultHeight: 2
  },
  rec_monotony: {
    id: 'rec_monotony',
    name: 'Overtraining Monotony Rating',
    description: 'Calculates workout variance to warn against overtraining syndromes.',
    defaultWidth: 2,
    defaultHeight: 1
  },

  // Environment widgets
  env_heat_acclimation: {
    id: 'env_heat_acclimation',
    name: 'Heat & Humidity Acclimatization',
    description: 'Rates high-temperature adaptation levels and dehydration risk caps.',
    defaultWidth: 2,
    defaultHeight: 1
  },
  env_impact_pace: {
    id: 'env_impact_pace',
    name: 'Climatic Pacing Impact Analysis',
    description: 'Graphs pacing adjustments required for extreme elevations or heat.',
    defaultWidth: 2,
    defaultHeight: 2
  },

  // Equipment widgets
  eq_shoe_mileage: {
    id: 'eq_shoe_mileage',
    name: 'Gear Cumulative Mileage Tracker',
    description: 'Aggregates mileage records for running shoes, highlighting retirement marks.',
    defaultWidth: 4,
    defaultHeight: 2
  },
  eq_injury_assessment: {
    id: 'eq_injury_assessment',
    name: 'Injury Risk Assessment',
    description: 'Monitors biomechanical risk factors based on shoe depletion levels.',
    defaultWidth: 2,
    defaultHeight: 2
  },

  // Connections widgets
  conn_strava: {
    id: 'conn_strava',
    name: 'Strava API Credentials Gate',
    description: 'Configures client credentials, webhook subscription IDs, and authorization tokens.',
    defaultWidth: 2,
    defaultHeight: 2
  },
  conn_intervals: {
    id: 'conn_intervals',
    name: 'Intervals.icu Integration Sync',
    description: 'Authenticates Intervals.icu keys to import external athletic load data.',
    defaultWidth: 2,
    defaultHeight: 2
  },

  // Data Health widgets
  health_integrity: {
    id: 'health_integrity',
    name: 'Sensor Data Signal Integrity',
    description: 'Grades overall dataset completeness across historical recordings.',
    defaultWidth: 2,
    defaultHeight: 2
  },
  health_anomaly_logs: {
    id: 'health_anomaly_logs',
    name: 'Telemetry Drops & Outliers Log',
    description: 'Tabulates GPS dropping spikes, sensor dropout points, and pace glitches.',
    defaultWidth: 4,
    defaultHeight: 2
  },

  // Settings widgets
  set_thresholds: {
    id: 'set_thresholds',
    name: 'Physiological Zone Calibrations',
    description: 'Calibrates customized threshold pace, resting HR, and power capacities.',
    defaultWidth: 4,
    defaultHeight: 2
  },
  set_sync_prefs: {
    id: 'set_sync_prefs',
    name: 'Automatic Sync Webhook Rules',
    description: 'Adjusts cron cycles, webhook trigger rules, and push alert limits.',
    defaultWidth: 2,
    defaultHeight: 1
  },

  // Search widgets
  search_query_input: {
    id: 'search_query_input',
    name: 'Advanced Structured Query Console',
    description: 'Input portal for structured natural or mathematical query terms.',
    defaultWidth: 4,
    defaultHeight: 1
  },
  search_results_grid: {
    id: 'search_results_grid',
    name: 'Filtered Results Matrix',
    description: 'Renders activity arrays and files matching custom query parameters.',
    defaultWidth: 4,
    defaultHeight: 2
  },

  // Compare widgets
  comp_activity_selector: {
    id: 'comp_activity_selector',
    name: 'Dual Ingested Run Picker',
    description: 'Selects base and target activities to overlay structural streams.',
    defaultWidth: 4,
    defaultHeight: 1
  },
  comp_delta_matrix: {
    id: 'comp_delta_matrix',
    name: 'Comparative Performance Delta Matrix',
    description: 'Tabulates the exact mathematical pace, HR, power, and decoupling deltas.',
    defaultWidth: 4,
    defaultHeight: 2
  }
};
