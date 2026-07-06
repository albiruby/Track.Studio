/**
 * Analysis Engine Types - Track.Studio
 * Structures for single-workout deterministic calculations.
 */

export interface ZoneDuration {
  zoneIndex: number;
  label: string;
  durationSeconds: number;
  percentage: number;
}

export interface SingleActivityAnalysis {
  activityId: string;
  userId: string;
  
  // Deterministic performance markers
  runningStressScore: number;     // RSS (Calculated deterministically from threshold, intensity, and duration)
  intensityFactor: number;        // Ratio of pacing to athlete's Functional Threshold Pace
  efficiencyFactor: number;       // Average Speed (m/s) divided by Average Heart Rate (bpm)
  
  // Decoupling (Cardiac Drift)
  // Explains aerobic efficiency by comparing first-half vs second-half efficiency factor.
  aerobicDecoupling: number | null; // Percentage (e.g. 0.04 represents +4% drift)
  
  // Pacing consistency metrics
  pacingVariability: number;      // Standard deviation of speed / average speed
  
  // Time-in-zones analysis
  heartRateZoneDurations: ZoneDuration[];
  paceZoneDurations: ZoneDuration[];
  
  // Elevation analytics
  averageClimbingGradient: number | null; // % slope of segments with upward elevation
  averageDescendingGradient: number | null; // % slope of segments with downward elevation
  
  calculatedAt: string;
}
