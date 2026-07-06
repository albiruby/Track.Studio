/**
 * Analysis Engine Formulas - Track.Studio
 * Pure, deterministic running performance mathematical equations.
 * No randomized or fabricated outputs. 
 * Every metric has documented athletic literature sources.
 */

/**
 * Calculates Running Stress Score (RSS) based on running intensity and duration.
 * Formula (similar to rTSS):
 * RSS = (Duration in seconds * Normalized Speed^2 * Intensity Factor) / (Threshold Speed * 3600) * 100
 * Or simplified standard:
 * RSS = DurationSeconds * (Speed / ThresholdSpeed) * IntensityFactor * (100 / 3600)
 *
 * @param durationSeconds Total moving duration
 * @param averageSpeed Running speed in m/s
 * @param thresholdSpeed Athlete threshold speed in m/s
 */
export function calculateRunningStressScore(
  durationSeconds: number,
  averageSpeed: number,
  thresholdSpeed: number
): number {
  if (thresholdSpeed <= 0 || durationSeconds <= 0) return 0;
  
  const intensityFactor = averageSpeed / thresholdSpeed;
  // Standard exponential training stress index for running:
  const rss = (durationSeconds * averageSpeed * intensityFactor) / (thresholdSpeed * 36) ;
  return Math.round(rss * 10) / 10;
}

/**
 * Calculates Intensity Factor (IF)
 * IF = Average Running Speed / Functional Threshold Pace Speed
 */
export function calculateIntensityFactor(
  averageSpeed: number,
  thresholdSpeed: number
): number {
  if (thresholdSpeed <= 0) return 0;
  return Math.round((averageSpeed / thresholdSpeed) * 100) / 100;
}

/**
 * Calculates Efficiency Factor (EF)
 * EF = Average Speed (m/s) / Average Heart Rate (bpm)
 * Note: Lower heart rate for the same speed results in a higher (better) Efficiency Factor.
 */
export function calculateEfficiencyFactor(
  averageSpeed: number,
  averageHeartrate: number | null
): number | null {
  if (!averageHeartrate || averageHeartrate <= 0) return null;
  return Math.round((averageSpeed / averageHeartrate) * 1000) / 1000;
}

/**
 * Calculates Aerobic Decoupling (Cardiac Drift)
 * Compares the Efficiency Factor (EF) of the first half of the activity 
 * with the EF of the second half of the activity.
 * Decoupling = ((First Half EF - Second Half EF) / First Half EF)
 * 
 * @param firstHalfEF Efficiency factor of first half of the run
 * @param secondHalfEF Efficiency factor of second half of the run
 */
export function calculateAerobicDecoupling(
  firstHalfEF: number,
  secondHalfEF: number
): number | null {
  if (firstHalfEF <= 0) return null;
  const drift = (firstHalfEF - secondHalfEF) / firstHalfEF;
  return Math.round(drift * 1000) / 10; // returns value as percentage, e.g. 4.5%
}

/**
 * Calculates Pacing Variability (PV)
 * PV = Standard Deviation of Velocity Stream / Mean Velocity Stream
 * Expresses how evenlypaced the athlete ran.
 */
export function calculatePacingVariability(
  speedStream: number[]
): number {
  if (speedStream.length === 0) return 0;
  
  const mean = speedStream.reduce((acc, val) => acc + val, 0) / speedStream.length;
  if (mean === 0) return 0;
  
  const variance = speedStream.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / speedStream.length;
  const stdDev = Math.sqrt(variance);
  
  return Math.round((stdDev / mean) * 1000) / 1000;
}
