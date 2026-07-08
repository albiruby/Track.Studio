/**
 * Track.Studio — Widget Documentation
 * Houses the scientific sports-science documentation and formula reference for widgets.
 */

export interface WidgetDocEntry {
  widgetId: string;
  scientificContext: string;
  formulas: { name: string; equation: string; explanation: string }[];
  parameters: { name: string; type: string; description: string }[];
}

export const WIDGET_DOCUMENTATION_REGISTRY: Record<string, WidgetDocEntry> = {
  home_profile: {
    widgetId: 'home_profile',
    scientificContext: 'Captures critical biological constraints used as the denominators in all performance scaling models (VO2max, FTP, Heart Rate Reserves). Change in body mass (weight) shifts power-to-weight and pace-to-weight scaling factors dynamically.',
    formulas: [
      {
        name: 'Heart Rate Reserve (HRR)',
        equation: 'HRR = MaxHR - RestingHR',
        explanation: 'The buffer range of cardiovascular effort available to the athlete.'
      },
      {
        name: 'FTP Power-to-Weight Ratio',
        equation: 'W/kg = FTP / Weight',
        explanation: 'Power output relative to body weight, crucial for gradient scaling.'
      }
    ],
    parameters: [
      { name: 'weightKg', type: 'number', description: 'Athlete mass in kilograms.' },
      { name: 'restingHr', type: 'number', description: 'Resting heart rate in beats per minute.' },
      { name: 'ftpWatts', type: 'number', description: 'Functional Threshold Power target in Watts.' }
    ]
  },
  home_recent_activity: {
    widgetId: 'home_recent_activity',
    scientificContext: 'Analyzes the absolute cardiovascular cost, pacing variability, and aerobic decoupling of the most recently ingested workout payload. Measures whether the pacing strategy was steady and if drift remained within aerobic efficiency caps.',
    formulas: [
      {
        name: 'Efficiency Factor (EF)',
        equation: 'EF = AverageSpeed (m/s) / AverageHeartRate (bpm)',
        explanation: 'Cardiovascular efficiency rating: pace achieved per single heartbeat.'
      },
      {
        name: 'Aerobic Decoupling (Cardiac Drift)',
        equation: 'Decoupling = (EF1stHalf - EF2ndHalf) / EF1stHalf',
        explanation: 'The percentage decline in efficiency between the first and second halves of a steady-state workout. Drift > 5% indicates aerobic fatigue or heat stress.'
      }
    ],
    parameters: [
      { name: 'distanceMeters', type: 'number', description: 'Total synchronized run distance.' },
      { name: 'durationSeconds', type: 'number', description: 'Total moving duration.' },
      { name: 'runningStressScore', type: 'number', description: 'Calculated metabolic stress (RSS).' }
    ]
  },
  home_weekly_summary: {
    widgetId: 'home_weekly_summary',
    scientificContext: 'Aggregates current weekly volume boundaries (distance, duration, RSS) to ensure progressive training load doesn\'t exceed acute thresholds (e.g. the 10% volume increase rule of thumb).',
    formulas: [
      {
        name: 'Weekly Progressive Volume Delta',
        equation: 'Variance % = (CurrentWeekRSS - TargetRSS) / TargetRSS * 100',
        explanation: 'Tracks alignment of the active microcycle against scheduled load caps.'
      }
    ],
    parameters: [
      { name: 'currentWeekDistanceKm', type: 'number', description: 'Accumulated weekly distance.' },
      { name: 'targetDistanceKm', type: 'number', description: 'Target microcycle volume benchmark.' }
    ]
  },
  home_performance_metrics: {
    widgetId: 'home_performance_metrics',
    scientificContext: 'Implements the Banister Impulse-Response Model of athletic adaptation, plotting long-term fitness (CTL), short-term fatigue (ATL), and real-time form (TSB). Use this to prevent acute overreaching and identify optimal pacing windows.',
    formulas: [
      {
        name: 'Chronic Training Load (CTL)',
        equation: 'CTL_t = CTL_{t-1} * e^{-1/42} + RSS_t * (1 - e^{-1/42})',
        explanation: 'Long-term aerobic fitness model (42-day exponentially weighted moving average of RSS).'
      },
      {
        name: 'Acute Training Load (ATL)',
        equation: 'ATL_t = ATL_{t-1} * e^{-1/7} + RSS_t * (1 - e^{-1/7})',
        explanation: 'Short-term metabolic fatigue model (7-day exponentially weighted moving average of RSS).'
      },
      {
        name: 'Training Stress Balance (TSB)',
        equation: 'TSB = CTL_{t-1} - ATL_{t-1}',
        explanation: 'Athletic form. Positive values represent fresh/peaking states. Negative values represent building/fatigued states.'
      }
    ],
    parameters: [
      { name: 'currentCtl', type: 'number', description: 'Calculated 42-day Chronic Training Load.' },
      { name: 'currentAtl', type: 'number', description: 'Calculated 7-day Acute Training Load.' },
      { name: 'currentTsb', type: 'number', description: 'Training Stress Balance (Form).' }
    ]
  }
};
