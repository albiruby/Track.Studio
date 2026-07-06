import { CanonicalActivity, CanonicalAthlete, CanonicalStream, CanonicalSplit } from '@/lib/data-platform/canonical/types';
import { MetricDefinition, MetricCategory } from './types';
import * as formulas from './formulas';

export interface MetricRegistryEntry extends MetricDefinition {
  calculate: (params: {
    activity: CanonicalActivity;
    athlete: CanonicalAthlete;
    stream?: CanonicalStream;
    history?: CanonicalActivity[];
    splits?: CanonicalSplit[];
  }) => any;
}

export class MetricRegistry {
  private static registry = new Map<string, MetricRegistryEntry>();

  public static register(entry: MetricRegistryEntry): void {
    this.registry.set(entry.metricId, entry);
  }

  public static get(metricId: string): MetricRegistryEntry | undefined {
    return this.registry.get(metricId);
  }

  public static list(): MetricRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  public static listByCategory(category: MetricCategory): MetricRegistryEntry[] {
    return this.list().filter(m => m.category === category);
  }
}

// ==========================================
// 1. PHYSICAL DIMENSIONS (ACTIVITY) METRICS
// ==========================================

MetricRegistry.register({
  metricId: 'moving_pace',
  name: 'Moving Pace',
  category: 'activity',
  scientificDefinition: 'Average pace computed strictly while in motion, excluding idle and paused periods.',
  formulaDescription: 'Moving Time / Distance (normalized to min/km decimal).',
  units: 'min/km',
  dependencies: ['distanceMeters', 'movingTimeSec'],
  assumptions: ['Device pause/resume operates correctly, or GPS speed filtering detects movement accurately.'],
  limitations: ['GPS drift during rest can artificially inflate distance and speed.'],
  version: '1.0.0',
  reference: 'General Athletic Standard',
  status: 'active',
  calculate: ({ activity }) => formulas.activity.calculateMovingPace(activity)
});

MetricRegistry.register({
  metricId: 'elapsed_pace',
  name: 'Elapsed Pace',
  category: 'activity',
  scientificDefinition: 'Gross average pace of the session including all rest, pauses, and traffic stops.',
  formulaDescription: 'Elapsed Time / Distance (normalized to min/km decimal).',
  units: 'min/km',
  dependencies: ['distanceMeters', 'elapsedTimeSec'],
  assumptions: ['The activity start and end times represent the true gross bounds.'],
  limitations: ['Extremely long pauses will result in huge paces that distort the visual scale.'],
  version: '1.0.0',
  reference: 'General Athletic Standard',
  status: 'active',
  calculate: ({ activity }) => formulas.activity.calculateElapsedPace(activity)
});

MetricRegistry.register({
  metricId: 'average_speed',
  name: 'Average Speed',
  category: 'activity',
  scientificDefinition: 'Overall average speed calculated using gross elapsed time.',
  formulaDescription: 'Total Distance / Total Elapsed Time (meters per second).',
  units: 'm/s',
  dependencies: ['distanceMeters', 'elapsedTimeSec'],
  assumptions: ['Gross timespan is fully captured.'],
  limitations: ['Does not represent athletic execution if long stops occurred.'],
  version: '1.0.0',
  reference: 'General Athletic Standard',
  status: 'active',
  calculate: ({ activity }) => formulas.activity.calculateAverageSpeed(activity)
});

MetricRegistry.register({
  metricId: 'moving_speed',
  name: 'Moving Speed',
  category: 'activity',
  scientificDefinition: 'Net average speed calculated strictly during periods of active movement.',
  formulaDescription: 'Total Distance / Net Moving Time (meters per second).',
  units: 'm/s',
  dependencies: ['distanceMeters', 'movingTimeSec'],
  assumptions: ['Movement detection threshold matches athlete mechanics.'],
  limitations: ['Over-filtering or under-filtering of movement based on hardware sensors.'],
  version: '1.0.0',
  reference: 'General Athletic Standard',
  status: 'active',
  calculate: ({ activity }) => formulas.activity.calculateMovingSpeed(activity)
});

MetricRegistry.register({
  metricId: 'distance',
  name: 'Distance',
  category: 'activity',
  scientificDefinition: 'Total cumulative horizontal distance covered during the session.',
  formulaDescription: 'Direct retrieval of standard standardized distance values in meters.',
  units: 'm',
  dependencies: ['distanceMeters'],
  assumptions: ['GPS coordinates or speed sensor distance calculations are reliable.'],
  limitations: ['Tunnel dropouts, indoor treadmill calculations, or signal multi-path interference.'],
  version: '1.0.0',
  reference: 'SI Units',
  status: 'active',
  calculate: ({ activity }) => formulas.activity.calculateDistance(activity)
});

MetricRegistry.register({
  metricId: 'duration',
  name: 'Duration',
  category: 'activity',
  scientificDefinition: 'Net active moving duration of the activity.',
  formulaDescription: 'Standard moving time duration in seconds.',
  units: 's',
  dependencies: ['movingTimeSec'],
  assumptions: ['State transitions between moving and stationary are accurately logged.'],
  limitations: ['Requires auto-pause thresholds matching the athlete activity.'],
  version: '1.0.0',
  reference: 'General Athletic Standard',
  status: 'active',
  calculate: ({ activity }) => formulas.activity.calculateDuration(activity)
});

MetricRegistry.register({
  metricId: 'calories',
  name: 'Energy Expenditure (Calories)',
  category: 'activity',
  scientificDefinition: 'Estimated metabolic energy consumed during the exercise.',
  formulaDescription: 'Retrieval of calories value in kilocalories (kcal).',
  units: 'kcal',
  dependencies: ['calories'],
  assumptions: ['Provider algorithms for energy expenditure are valid.'],
  limitations: ['Extremely indirect estimation based on HR, weight, age, and speed, with up to 20% variance.'],
  version: '1.0.0',
  reference: 'Metabolic Equivalents (METs)',
  status: 'active',
  calculate: ({ activity }) => formulas.activity.calculateCalories(activity)
});

MetricRegistry.register({
  metricId: 'work',
  name: 'Mechanical Work',
  category: 'activity',
  scientificDefinition: 'Total physical mechanical work executed during the workout.',
  formulaDescription: 'Average Power * Moving Duration / 1000 (expressed in kilojoules). Fallback to standard provider kilojoules.',
  units: 'kJ',
  dependencies: ['averagePowerWatts', 'movingTimeSec'],
  assumptions: ['Power readings are calibrated and integrated properly over duration.'],
  limitations: ['Treadmill power or running power estimators are empirical and vary.'],
  version: '1.0.0',
  reference: 'Physics Standard',
  status: 'active',
  calculate: ({ activity }) => formulas.activity.calculateWork(activity)
});

// ==========================================
// 2. ADVANCED PACING METRICS
// ==========================================

MetricRegistry.register({
  metricId: 'avg_pace',
  name: 'Average Pace',
  category: 'pacing',
  scientificDefinition: 'Average pace computed over the entire net moving time.',
  formulaDescription: 'Average decimal minutes per kilometer.',
  units: 'min/km',
  dependencies: ['distanceMeters', 'movingTimeSec'],
  assumptions: ['Both parameters are non-zero.'],
  limitations: ['Does not capture intra-workout pacing strategies.'],
  version: '1.0.0',
  reference: 'General Athletic Standard',
  status: 'active',
  calculate: ({ activity }) => formulas.pacing.calculateAveragePace(activity)
});

MetricRegistry.register({
  metricId: 'best_pace',
  name: 'Best Pace',
  category: 'pacing',
  scientificDefinition: 'The fastest sustained running pace achieved, cleaned of momentary GPS spikes.',
  formulaDescription: 'Minimum pace in 30s rolling speed stream or maximum speed fallback.',
  units: 'min/km',
  dependencies: ['maximumSpeedMps'],
  assumptions: ['Velocity values are cleaned of spikes.'],
  limitations: ['A single GPS point error can create a massive speed spike, necessitating rolling filters.'],
  version: '1.0.0',
  reference: 'General Athletic Standard',
  status: 'active',
  calculate: ({ activity, stream }) => formulas.pacing.calculateBestPace(activity, stream)
});

MetricRegistry.register({
  metricId: 'worst_pace',
  name: 'Worst Pace',
  category: 'pacing',
  scientificDefinition: 'The slowest sustained pace recorded while still actively running (excluding stops).',
  formulaDescription: 'Maximum pace in stream where speed is greater than or equal to 0.5 m/s.',
  units: 'min/km',
  dependencies: [],
  assumptions: ['Speeds below 0.5 m/s represent stops rather than running.'],
  limitations: ['May capture walking breaks, which is expected.'],
  version: '1.0.0',
  reference: 'General Athletic Standard',
  status: 'active',
  calculate: ({ activity, stream }) => formulas.pacing.calculateWorstPace(activity, stream)
});

MetricRegistry.register({
  metricId: 'split_type',
  name: 'Pacing Split Type',
  category: 'pacing',
  scientificDefinition: 'Categorization of pacing distribution between the first and second halves of the activity.',
  formulaDescription: 'Ratio of second-half speed to first-half speed. >1.015 = negative, <0.985 = positive, else even.',
  units: 'category',
  dependencies: [],
  assumptions: ['Splits are ordered and sequential.'],
  limitations: ['Requires at least 2 splits to formulate a comparison.'],
  version: '1.0.0',
  reference: 'Pacing Strategy Guidelines',
  status: 'active',
  calculate: ({ splits }) => formulas.pacing.calculateSplitType(splits || [])
});

MetricRegistry.register({
  metricId: 'pace_variability',
  name: 'Pace Variability',
  category: 'pacing',
  scientificDefinition: 'The coefficient of variation of running pace throughout the session, reflecting rhythm and speed adjustments.',
  formulaDescription: 'Standard deviation of pace values divided by the mean pace.',
  units: 'ratio',
  dependencies: [],
  assumptions: ['High values indicate irregular or interval-based running; low values indicate steady-state.'],
  limitations: ['Heavily skewed by sharp turns or hilly terrain forcing pace changes.'],
  version: '1.0.0',
  reference: 'Sport Biomechanics Standard',
  status: 'active',
  calculate: ({ splits, stream }) => formulas.pacing.calculatePaceVariability(splits || [], stream)
});

MetricRegistry.register({
  metricId: 'pace_stability',
  name: 'Pace Stability',
  category: 'pacing',
  scientificDefinition: 'The inverse of pacing variability, indicating how consistently a steady pace was maintained.',
  formulaDescription: '1 / (1 + Pace Variability). Output ranges from 0 (highly unstable) to 1 (perfectly stable).',
  units: 'index',
  dependencies: [],
  assumptions: ['Steady-state training is the goal.'],
  limitations: ['Interval workouts will score very low, which is functionally correct but not a negative indicator.'],
  version: '1.0.0',
  reference: 'Sport Biomechanics Standard',
  status: 'active',
  calculate: ({ splits, stream }) => formulas.pacing.calculatePaceStability(splits || [], stream)
});

MetricRegistry.register({
  metricId: 'critical_pace',
  name: 'Critical Pace (Functional Threshold)',
  category: 'pacing',
  scientificDefinition: 'The theoretical pace that can be sustained for a prolonged duration (approx. 45-60 min) without accumulation of lactate.',
  formulaDescription: 'Calculated as 105% of the best 20-minute average pace stream, or 105% of average pace as fallback.',
  units: 'min/km',
  dependencies: [],
  assumptions: ['A maximal 20-minute effort occurred, or the fallback approximation holds.'],
  limitations: ['Will underestimate threshold if the activity did not contain sustained hard effort.'],
  version: '1.0.0',
  reference: 'Monod and Scherrer Critical Power Model',
  status: 'active',
  calculate: ({ activity, stream }) => formulas.pacing.calculateCriticalPace(activity, stream)
});

// ==========================================
// 3. CARDIOVASCULAR (HEART RATE) METRICS
// ==========================================

MetricRegistry.register({
  metricId: 'avg_hr',
  name: 'Average Heart Rate',
  category: 'heart-rate',
  scientificDefinition: 'Arithmetic mean of heart beats per minute logged during the session.',
  formulaDescription: 'Direct average heart rate value (bpm).',
  units: 'bpm',
  dependencies: ['averageHeartRateBpm'],
  assumptions: ['Sensor connectivity is constant.'],
  limitations: ['Includes warm-up and cooldown periods, which drag down the average.'],
  version: '1.0.0',
  reference: 'Cardiology Standard',
  status: 'active',
  calculate: ({ activity }) => formulas.heartRate.calculateAverageHR(activity)
});

MetricRegistry.register({
  metricId: 'max_hr',
  name: 'Maximum Heart Rate',
  category: 'heart-rate',
  scientificDefinition: 'The peak cardiovascular rate observed during the training session.',
  formulaDescription: 'Peak heart rate value (bpm).',
  units: 'bpm',
  dependencies: ['maxHeartRateBpm'],
  assumptions: ['Reading is clean of electrical spikes or optical sensor lock.'],
  limitations: ['Optical wrist-based sensors are prone to cadence-lock spikes.'],
  version: '1.0.0',
  reference: 'Cardiology Standard',
  status: 'active',
  calculate: ({ activity }) => formulas.heartRate.calculateMaxHR(activity)
});

MetricRegistry.register({
  metricId: 'hr_drift',
  name: 'Heart Rate Drift (Cardiac Drift)',
  category: 'heart-rate',
  scientificDefinition: 'The increase in heart rate over time under a constant aerobic workload, indicating metabolic stress and dehydration.',
  formulaDescription: '((Average HR of 2nd Half - Average HR of 1st Half) / Average HR of 1st Half) * 100.',
  units: '%',
  dependencies: [],
  assumptions: ['Workload/pace remained relatively constant throughout the activity.'],
  limitations: ['If pace changes drastically, drift represents pacing changes rather than cardiac drift.'],
  version: '1.0.0',
  reference: 'Coyle & Gonzalez-Alonso (Cardiac Drift, 2001)',
  status: 'active',
  calculate: ({ stream }) => (stream ? formulas.heartRate.calculateHRDrift(stream) : null)
});

MetricRegistry.register({
  metricId: 'hrv_proxy',
  name: 'Heart Rate Variability Proxy (SNDR)',
  category: 'heart-rate',
  scientificDefinition: 'A proxy for heart rate variability during exercise, representing autonomic nervous system control.',
  formulaDescription: 'Standard deviation of the heart rate stream (SNDR).',
  units: 'ms',
  dependencies: [],
  assumptions: ['Heart rate sampling is continuous at 1Hz.'],
  limitations: ['Is not RMSSD of R-R intervals; only serves as a macro-stability index.'],
  version: '1.0.0',
  reference: 'Autonomic Nervous System Guidelines',
  status: 'active',
  calculate: ({ stream }) => (stream ? formulas.heartRate.calculateWorkoutHRVProxy(stream) : null)
});

MetricRegistry.register({
  metricId: 'hr_decoupling',
  name: 'Aerobic Decoupling (Pa:Hr)',
  category: 'heart-rate',
  scientificDefinition: 'Measures the aerobic stability by comparing the ratio of speed to heart rate in the first half vs. the second half.',
  formulaDescription: '((Speed/HR Half 1 - Speed/HR Half 2) / Speed/HR Half 1) * 100. Values < 5% indicate excellent aerobic fitness.',
  units: '%',
  dependencies: [],
  assumptions: ['Mainly flat terrain, constant wind, and steady effort.'],
  limitations: ['Hills drastically decouple speed and HR, rendering calculations inaccurate.'],
  version: '1.0.0',
  reference: 'Joe Friel (The Triathlete\'s Training Bible)',
  status: 'active',
  calculate: ({ activity, stream }) => formulas.heartRate.calculateHRDecoupling(activity, stream)
});

// ==========================================
// 4. CARDIO-MECHANICAL (EFFICIENCY) METRICS
// ==========================================

MetricRegistry.register({
  metricId: 'running_effectiveness',
  name: 'Running Effectiveness',
  category: 'efficiency',
  scientificDefinition: 'The ratio of speed (m/s) to specific power (W/kg), representing mechanical efficiency.',
  formulaDescription: 'Speed / (Power / Weight).',
  units: 'ratio',
  dependencies: ['averageSpeedMps', 'averagePowerWatts'],
  assumptions: ['Athlete weight is up-to-date and accurate.'],
  limitations: ['Wind resistance and incline changes alter efficiency without change in speed.'],
  version: '1.0.0',
  reference: 'Dr. Andrew Coggan / WKO4 running metrics',
  status: 'active',
  calculate: ({ activity, athlete }) => formulas.efficiency.calculateRunningEffectiveness(activity, athlete)
});

MetricRegistry.register({
  metricId: 'efficiency_factor',
  name: 'Efficiency Factor (EF)',
  category: 'efficiency',
  scientificDefinition: 'Cardiovascular efficiency index. Relates mechanical output (Normalized Power or Speed) to heart rate cost.',
  formulaDescription: 'If power is present: NP / Average HR. Else: Speed (meters/min) / Average HR.',
  units: 'ratio',
  dependencies: ['averageHeartRateBpm'],
  assumptions: ['Average HR is clean and represents metabolic state.'],
  limitations: ['Thermal strain and dehydration artificially lower EF by raising HR without power change.'],
  version: '1.0.0',
  reference: 'Joe Friel\'s Training Metrics',
  status: 'active',
  calculate: ({ activity, athlete, stream }) => formulas.efficiency.calculateEfficiencyFactor(activity, athlete, stream)
});

MetricRegistry.register({
  metricId: 'stride_length',
  name: 'Stride Length',
  category: 'efficiency',
  scientificDefinition: 'The physical distance covered per single running stride (one full gait cycle).',
  formulaDescription: 'Speed (m/s) / (Cadence (RPM) * 2 / 60) in meters.',
  units: 'm',
  dependencies: ['averageSpeedMps', 'averageCadenceRpm'],
  assumptions: ['Cadence represents single-foot revolutions per minute.'],
  limitations: ['Treadmill running gait or terrain slips alter cadence ratios.'],
  version: '1.0.0',
  reference: 'Running Biomechanics (Dillman, 1975)',
  status: 'active',
  calculate: ({ activity }) => formulas.efficiency.calculateStrideLength(activity)
});

// ==========================================
// 5. TRAINING STRESS AND LOAD METRICS
// ==========================================

MetricRegistry.register({
  metricId: 'bannister_trimp',
  name: 'Bannister TRIMP',
  category: 'load',
  scientificDefinition: 'The classical cardiovascular training load index, weighting duration by an exponential heart rate reserve multiplier.',
  formulaDescription: 'Duration (min) * fractional HR reserve * exp(1.92 * fractional HR reserve). Factor 1.67 used for females.',
  units: 'points',
  dependencies: ['averageHeartRateBpm'],
  assumptions: ['Resting and Max HR are set correctly.'],
  limitations: ['Exponential curve can over-penalize short, anaerobic efforts.'],
  version: '1.0.0',
  reference: 'Bannister, E.W. (1991) Training Impulse',
  status: 'active',
  calculate: ({ activity, athlete }) => formulas.load.calculateBannisterTRIMP(activity, athlete)
});

MetricRegistry.register({
  metricId: 'edwards_trimp',
  name: 'Edwards TRIMP',
  category: 'load',
  scientificDefinition: 'A cardiovascular load index calculated by multiplying the duration in minutes spent in five discrete heart rate zones by the zone\'s ordinal value.',
  formulaDescription: 'Sum of (Time in HR Zone * Zone Multiplier). Zones: Z1=1, Z2=2, Z3=3, Z4=4, Z5=5.',
  units: 'points',
  dependencies: [],
  assumptions: ['Zone boundaries represent true physiological thresholds.'],
  limitations: ['Step-function changes in zone multiplication discard granular intensity changes.'],
  version: '1.0.0',
  reference: 'Edwards, S. (1993) Heart Rate Monitor Guide',
  status: 'active',
  calculate: ({ activity, athlete, stream }) => formulas.load.calculateEdwardsTRIMP(activity, athlete, stream)
});

MetricRegistry.register({
  metricId: 'hrss',
  name: 'Heart Rate Stress Score (HRSS)',
  category: 'load',
  scientificDefinition: 'A standardized stress score based on heart rate, equating 1 hour of sustained threshold effort to 100 points.',
  formulaDescription: '(Duration * fractional HR reserve * exp(1.92 * HRr) / 3600) * 100.',
  units: 'points',
  dependencies: ['averageHeartRateBpm'],
  assumptions: ['Lactate threshold heart rate corresponds to standard HRSS models.'],
  limitations: ['Heart rate lag during short sprints underestimates anaerobic strain.'],
  version: '1.0.0',
  reference: 'TrainingPeaks Heart Rate Stress Score model',
  status: 'active',
  calculate: ({ activity, athlete }) => formulas.load.calculateHRSS(activity, athlete)
});

MetricRegistry.register({
  metricId: 'rss',
  name: 'Running Stress Score (RSS)',
  category: 'load',
  scientificDefinition: 'The power-based training stress score, modeling the exponential increase in fatigue with intensity.',
  formulaDescription: '100 * (Duration * NP * IF) / (3600 * FTP). Speed proxy model utilized if power is absent.',
  units: 'points',
  dependencies: [],
  assumptions: ['Running power sensor or speed fallback matches actual metabolic load.'],
  limitations: ['Running power sensors estimate rather than measure force.'],
  version: '1.0.0',
  reference: 'Stryd Training Stress / Coggan TSS model',
  status: 'active',
  calculate: ({ activity, athlete, stream }) => formulas.load.calculateRSS(activity, athlete, stream)
});

MetricRegistry.register({
  metricId: 'tss',
  name: 'Training Stress Score (TSS)',
  category: 'load',
  scientificDefinition: 'The unified, canonical training load metric representing overall physiological stress.',
  formulaDescription: 'Uses power-based Running Stress Score (RSS) if power is present, otherwise falls back to HRSS.',
  units: 'points',
  dependencies: [],
  assumptions: ['Available sensors are accurate.'],
  limitations: ['Requires either robust heart rate or power readings.'],
  version: '1.0.0',
  reference: 'Andrew Coggan, TrainingPeaks',
  status: 'active',
  calculate: ({ activity, athlete, stream }) => formulas.load.calculateTSS(activity, athlete, stream)
});

// ==========================================
// 6. MULTI-ACTIVITY (RECOVERY & PERFORMANCE TREND) METRICS
// ==========================================

MetricRegistry.register({
  metricId: 'ctl',
  name: 'Chronic Training Load (CTL / Fitness)',
  category: 'recovery',
  scientificDefinition: 'An exponentially weighted moving average of daily training stress representing historical training volume, serving as a proxy for physical fitness.',
  formulaDescription: 'CTL_t = CTL_t-1 + (TSS_t - CTL_t-1) / 42.',
  units: 'points',
  dependencies: [],
  assumptions: ['A 42-day time constant describes the decay rate of fitness adaptations.'],
  limitations: ['Does not reflect specific adaptations (e.g. anaerobic power vs aerobic endurance).'],
  version: '1.0.0',
  reference: 'Coggan Impulse Response Model',
  status: 'active',
  calculate: ({ history, athlete }) => {
    const trends = formulas.recovery.calculatePerformanceTrends(history || [], athlete);
    return trends.length > 0 ? trends[trends.length - 1].ctl : 0;
  }
});

MetricRegistry.register({
  metricId: 'atl',
  name: 'Acute Training Load (ATL / Fatigue)',
  category: 'recovery',
  scientificDefinition: 'An exponentially weighted moving average of daily training stress representing short-term fatigue accumulation.',
  formulaDescription: 'ATL_t = ATL_t-1 + (TSS_t - ATL_t-1) / 7.',
  units: 'points',
  dependencies: [],
  assumptions: ['A 7-day time constant describes the decay rate of fatigue.'],
  limitations: ['Does not account for non-training fatigue (sleep deprivation, nutritional gaps).'],
  version: '1.0.0',
  reference: 'Coggan Impulse Response Model',
  status: 'active',
  calculate: ({ history, athlete }) => {
    const trends = formulas.recovery.calculatePerformanceTrends(history || [], athlete);
    return trends.length > 0 ? trends[trends.length - 1].atl : 0;
  }
});

MetricRegistry.register({
  metricId: 'tsb',
  name: 'Training Stress Balance (TSB / Form)',
  category: 'recovery',
  scientificDefinition: 'The relationship between chronic fitness (CTL) and acute fatigue (ATL), predicting peak readiness (Form).',
  formulaDescription: 'TSB_t = CTL_t-1 - ATL_t-1 (Form is yesterday\'s fitness minus yesterday\'s fatigue).',
  units: 'points',
  dependencies: [],
  assumptions: ['Positive values represent freshness and peaking states; negative values represent training adaptation states.'],
  limitations: ['Highly individual; some athletes race well with negative TSB, others require high positive values.'],
  version: '1.0.0',
  reference: 'Coggan Impulse Response Model',
  status: 'active',
  calculate: ({ history, athlete }) => {
    const trends = formulas.recovery.calculatePerformanceTrends(history || [], athlete);
    return trends.length > 0 ? trends[trends.length - 1].tsb : 0;
  }
});

MetricRegistry.register({
  metricId: 'monotony_7day',
  name: '7-Day Training Monotony',
  category: 'recovery',
  scientificDefinition: 'Measures the uniformity of training load over a 7-day period, indicating lack of training session variation.',
  formulaDescription: 'Mean of Daily Load / Standard Deviation of Daily Load over 7 days. Values > 2.0 indicate overtraining risk.',
  units: 'ratio',
  dependencies: [],
  assumptions: ['Uniform training loads increase overtraining risk by omitting rest cycles.'],
  limitations: ['Skewed if training history is incomplete or has gaps.'],
  version: '1.0.0',
  reference: 'Foster, C. (1998) Monitoring Training in Athletes',
  status: 'active',
  calculate: ({ history, athlete }) => formulas.recovery.calculateTrainingMonotony7Day(history || [], athlete)
});

MetricRegistry.register({
  metricId: 'strain_7day',
  name: '7-Day Training Strain',
  category: 'recovery',
  scientificDefinition: 'The overall combined risk of overtraining, combining weekly volume load and training monotony.',
  formulaDescription: 'Total 7-Day Load * Monotony. Values > 3000 indicate high overtraining risk.',
  units: 'points',
  dependencies: [],
  assumptions: ['High monotony accelerates the physiological strain of a given training volume.'],
  limitations: ['Depends heavily on the accuracy of the underlying daily TSS calculations.'],
  version: '1.0.0',
  reference: 'Foster, C. (1998) Monitoring Training in Athletes',
  status: 'active',
  calculate: ({ history, athlete }) => formulas.recovery.calculateTrainingStrain7Day(history || [], athlete)
});

// ==========================================
// 7. DATA QUALITY METRICS
// ==========================================

MetricRegistry.register({
  metricId: 'integrity_score',
  name: 'Data Integrity Score',
  category: 'data-quality',
  scientificDefinition: 'Overall data completeness and sensor quality score, reflecting recording accuracy and signal completeness.',
  formulaDescription: 'Composite average of GPS, HR, power, and cadence stream coverages, penalized by flatline drops.',
  units: '%',
  dependencies: [],
  assumptions: ['Continuous 1Hz logging is the gold standard.'],
  limitations: ['Does not evaluate the absolute accuracy of the sensors (e.g. optical HR offset), only signal continuity.'],
  version: '1.0.0',
  reference: 'Data Engineering Standards',
  status: 'active',
  calculate: ({ activity, stream }) => formulas.dataQuality.calculateDataIntegrityScore(activity, stream)
});
