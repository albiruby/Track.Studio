/**
 * Performance Engine Types - Track.Studio
 * Handles multi-activity performance trends, Fitness (CTL), Fatigue (ATL), and Form (TSB) metrics.
 */

export interface TrainingLoadMetric {
  date: string; // YYYY-MM-DD
  chronicTrainingLoad: number; // CTL (Fitness) - 42-day weighted moving average of RSS
  acuteTrainingLoad: number;   // ATL (Fatigue) - 7-day weighted moving average of RSS
  trainingStressBalance: number; // TSB (Form) = CTL - ATL
}

export interface PeakMetric {
  durationSeconds: number; // e.g., 30s, 60s, 300s (5m), 1200s (20m), 3600s (1h)
  value: number;           // speed in m/s, or heart rate in bpm
  activityId: string;      // activity where peak occurred
  date: string;            // date when peak occurred
}

export interface PerformanceTrends {
  userId: string;
  calculatedAt: string;
  
  // Historical training load points
  loadHistory: TrainingLoadMetric[];
  
  // Power/Speed Duration Curve (Peak running speeds at fixed durations)
  peakPaceCurve: PeakMetric[];
  
  // Peak heart rate curve
  peakHeartRateCurve: PeakMetric[];
  
  // Summary parameters
  currentFitness: number; // Current CTL
  currentFatigue: number; // Current ATL
  currentForm: number;    // Current TSB
  
  // Chronic Training Load Ramp Rate (Fitness change rate over last 7 days)
  ctlRampRate: number;
}
