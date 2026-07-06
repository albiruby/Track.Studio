import { CanonicalActivity, CanonicalSplit, CanonicalStream } from '@/lib/data-platform/canonical/types';
import { mpsToDecimalPace, calculateVariance, calculateStandardDeviation, rollingAverage } from './utils';

export const FORMULA_VERSION = '1.0.0';

/**
 * Calculates average pace in decimal min/km
 */
export function calculateAveragePace(activity: CanonicalActivity): number {
  if (activity.distanceMeters <= 0 || activity.movingTimeSec <= 0) return 0;
  return mpsToDecimalPace(activity.distanceMeters / activity.movingTimeSec);
}

/**
 * Calculates the best pace (min/km) from activity or streams.
 */
export function calculateBestPace(activity: CanonicalActivity, stream?: CanonicalStream): number {
  if (stream && stream.velocityMps && stream.velocityMps.length > 0) {
    // Look at 30-second rolling average of speed to filter out GPS spikes
    const smoothSpeeds = rollingAverage(stream.velocityMps, 30);
    const maxSpeed = Math.max(...smoothSpeeds, 0);
    if (maxSpeed > 0) return mpsToDecimalPace(maxSpeed);
  }
  return activity.maximumSpeedMps > 0 ? mpsToDecimalPace(activity.maximumSpeedMps) : 0;
}

/**
 * Calculates the worst pace (min/km) excluding stops.
 * Stops can be defined as speed < 0.5 m/s.
 */
export function calculateWorstPace(activity: CanonicalActivity, stream?: CanonicalStream): number {
  if (stream && stream.velocityMps && stream.velocityMps.length > 0) {
    // Filter out speeds below 0.5 m/s (approx 33:20 min/km, which is basically a stop/walk)
    const movingSpeeds = stream.velocityMps.filter(v => v >= 0.5);
    if (movingSpeeds.length > 0) {
      const minMovingSpeed = Math.min(...movingSpeeds);
      return mpsToDecimalPace(minMovingSpeed);
    }
  }
  // Fallback to elapsed speed if worse than average speed
  const elapsedSpeed = activity.distanceMeters / Math.max(1, activity.elapsedTimeSec);
  return mpsToDecimalPace(elapsedSpeed || 0.1);
}

/**
 * Analyzes splits to classify as 'negative' (faster second half), 'positive' (slower second half), or 'even'
 */
export function calculateSplitType(splits: CanonicalSplit[]): 'negative' | 'positive' | 'even' {
  if (splits.length < 2) return 'even';
  const midPoint = Math.ceil(splits.length / 2);
  const firstHalf = splits.slice(0, midPoint);
  const secondHalf = splits.slice(midPoint);

  const firstHalfAvgSpeed = firstHalf.reduce((sum, s) => sum + s.averageSpeedMps, 0) / firstHalf.length;
  const secondHalfAvgSpeed = secondHalf.reduce((sum, s) => sum + s.averageSpeedMps, 0) / secondHalf.length;

  if (firstHalfAvgSpeed === 0 || secondHalfAvgSpeed === 0) return 'even';

  const speedRatio = secondHalfAvgSpeed / firstHalfAvgSpeed; // > 1 means second half was faster (negative split)
  if (speedRatio > 1.015) return 'negative';
  if (speedRatio < 0.985) return 'positive';
  return 'even';
}

/**
 * Calculates Split Variance based on km or mile splits
 */
export function calculateSplitVariance(splits: CanonicalSplit[]): number {
  if (splits.length < 2) return 0;
  const paces = splits.map(s => mpsToDecimalPace(s.averageSpeedMps)).filter(p => p > 0);
  return calculateVariance(paces);
}

/**
 * Pace Variability: standard deviation of split paces / mean split pace
 */
export function calculatePaceVariability(splits: CanonicalSplit[], stream?: CanonicalStream): number {
  if (stream && stream.velocityMps && stream.velocityMps.length > 1) {
    const paces = stream.velocityMps.map(v => mpsToDecimalPace(v)).filter(p => p > 0 && p < 30);
    if (paces.length > 1) {
      const sd = calculateStandardDeviation(paces);
      const mean = paces.reduce((a, b) => a + b, 0) / paces.length;
      return mean > 0 ? sd / mean : 0;
    }
  }

  if (splits.length > 1) {
    const paces = splits.map(s => mpsToDecimalPace(s.averageSpeedMps)).filter(p => p > 0);
    if (paces.length > 1) {
      const sd = calculateStandardDeviation(paces);
      const mean = paces.reduce((a, b) => a + b, 0) / paces.length;
      return mean > 0 ? sd / mean : 0;
    }
  }
  return 0;
}

/**
 * Pace Stability: inverse of pace variability. Ranges from 0 to 1.
 */
export function calculatePaceStability(splits: CanonicalSplit[], stream?: CanonicalStream): number {
  const variability = calculatePaceVariability(splits, stream);
  return parseFloat((1 / (1 + variability)).toFixed(4));
}

/**
 * Speed Variability: Standard deviation of speed stream / average speed
 */
export function calculateSpeedVariability(stream: CanonicalStream): number {
  if (!stream.velocityMps || stream.velocityMps.length <= 1) return 0;
  const sd = calculateStandardDeviation(stream.velocityMps);
  const mean = stream.velocityMps.reduce((sum, v) => sum + v, 0) / stream.velocityMps.length;
  return mean > 0 ? parseFloat((sd / mean).toFixed(4)) : 0;
}

/**
 * Critical Pace (Threshold Pace)
 * Derived from the best 20-minute average pace multiplied by 1.05 (since 20-min pace is approx 105% of threshold pace)
 */
export function calculateCriticalPace(activity: CanonicalActivity, stream?: CanonicalStream): number {
  // If there's a 20-minute best effort in the activity, use it
  const best20Min = activity.bestEfforts.find(e => e.name === '20min' || Math.abs(e.distanceMeters - 4000) < 500); // placeholder matching
  if (best20Min && best20Min.movingTimeSec > 0) {
    const mps = best20Min.distanceMeters / best20Min.movingTimeSec;
    const pace = mpsToDecimalPace(mps);
    return parseFloat((pace * 1.05).toFixed(4)); // Threshold pace is slower than 20m pace (higher decimal value)
  }

  // Calculate from stream if available
  if (stream && stream.velocityMps && stream.timeSec && stream.timeSec.length >= 1200) {
    // 20 minutes = 1200 seconds
    const rollingSpeeds = rollingAverage(stream.velocityMps, 1200);
    const max20MinSpeed = Math.max(...rollingSpeeds, 0);
    if (max20MinSpeed > 0) {
      const pace = mpsToDecimalPace(max20MinSpeed);
      return parseFloat((pace * 1.05).toFixed(4));
    }
  }

  // Graceful fallback: 105% of average pace
  const avgPace = calculateAveragePace(activity);
  return parseFloat((avgPace * 1.05).toFixed(4));
}
