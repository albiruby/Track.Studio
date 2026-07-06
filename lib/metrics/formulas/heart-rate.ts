import { CanonicalActivity, CanonicalStream, CanonicalAthlete } from '@/lib/data-platform/canonical/types';
import { calculateStandardDeviation } from './utils';

export const FORMULA_VERSION = '1.0.0';

/**
 * Basic HR values
 */
export function calculateAverageHR(activity: CanonicalActivity): number | null {
  return activity.averageHeartRateBpm;
}

export function calculateMaxHR(activity: CanonicalActivity): number | null {
  return activity.maxHeartRateBpm;
}

export function calculateMinHR(stream?: CanonicalStream): number | null {
  if (stream && stream.heartRateBpm && stream.heartRateBpm.length > 0) {
    const validHrs = stream.heartRateBpm.filter(h => h > 30);
    if (validHrs.length > 0) return Math.min(...validHrs);
  }
  return null;
}

/**
 * Calculates Heart Rate Reserve (HRR) and the percentage of HRR utilized
 */
export function calculateHRR(athlete: CanonicalAthlete): number | null {
  if (athlete.maxHeartRateBpm && athlete.restingHeartRateBpm) {
    return athlete.maxHeartRateBpm - athlete.restingHeartRateBpm;
  }
  return null;
}

export function calculateHRRPercentage(activity: CanonicalActivity, athlete: CanonicalAthlete): number | null {
  if (!activity.averageHeartRateBpm) return null;
  const hrr = calculateHRR(athlete);
  if (!hrr || !athlete.restingHeartRateBpm) return null;
  const percentage = ((activity.averageHeartRateBpm - athlete.restingHeartRateBpm) / hrr) * 100;
  return parseFloat(percentage.toFixed(2));
}

/**
 * HR Drift: Compare first half average HR to second half average HR (for constant workload, HR rises)
 */
export function calculateHRDrift(stream: CanonicalStream): number | null {
  if (!stream.heartRateBpm || stream.heartRateBpm.length < 120) return null;
  const midPoint = Math.floor(stream.heartRateBpm.length / 2);
  const firstHalf = stream.heartRateBpm.slice(0, midPoint).filter(h => h > 30);
  const secondHalf = stream.heartRateBpm.slice(midPoint).filter(h => h > 30);

  if (firstHalf.length === 0 || secondHalf.length === 0) return null;

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const drift = ((avgSecond - avgFirst) / avgFirst) * 100;
  return parseFloat(drift.toFixed(2));
}

/**
 * HR Variability (SDDN proxy) inside the workout session
 */
export function calculateWorkoutHRVProxy(stream: CanonicalStream): number | null {
  if (!stream.heartRateBpm || stream.heartRateBpm.length < 30) return null;
  const validHrs = stream.heartRateBpm.filter(h => h > 30);
  if (validHrs.length === 0) return null;
  return parseFloat(calculateStandardDeviation(validHrs).toFixed(2));
}

/**
 * Calculates time spent in HR Zones (Z1-Z5).
 * Zones configured relative to Max HR:
 * Z1: 50-60%, Z2: 60-70%, Z3: 70-80%, Z4: 80-90%, Z5: 90-100%
 */
export function calculateTimeInHRZones(activity: CanonicalActivity, athlete: CanonicalAthlete, stream?: CanonicalStream): number[] {
  const maxHr = athlete.maxHeartRateBpm || activity.maxHeartRateBpm || 190;
  const restingHr = athlete.restingHeartRateBpm || 60;
  
  // Define zone thresholds (bpm)
  // We can use simple Max HR method
  const z1Min = maxHr * 0.50;
  const z2Min = maxHr * 0.60;
  const z3Min = maxHr * 0.70;
  const z4Min = maxHr * 0.80;
  const z5Min = maxHr * 0.90;

  let z1 = 0, z2 = 0, z3 = 0, z4 = 0, z5 = 0;

  if (stream && stream.heartRateBpm && stream.heartRateBpm.length > 0) {
    for (const hr of stream.heartRateBpm) {
      if (hr >= z5Min) z5++;
      else if (hr >= z4Min) z4++;
      else if (hr >= z3Min) z3++;
      else if (hr >= z2Min) z2++;
      else if (hr >= z1Min) z1++;
    }
  } else {
    // If we don't have streams, distribute duration based on average HR
    const avg = activity.averageHeartRateBpm || maxHr * 0.7;
    const dur = activity.movingTimeSec;
    if (avg >= z5Min) z5 = dur;
    else if (avg >= z4Min) z4 = dur;
    else if (avg >= z3Min) z3 = dur;
    else if (avg >= z2Min) z2 = dur;
    else if (avg >= z1Min) z1 = dur;
  }

  return [z1, z2, z3, z4, z5];
}

/**
 * Calculates HR zone distribution percentages
 */
export function calculateHRZoneDistribution(activity: CanonicalActivity, athlete: CanonicalAthlete, stream?: CanonicalStream): number[] {
  const times = calculateTimeInHRZones(activity, athlete, stream);
  const total = times.reduce((a, b) => a + b, 0);
  if (total === 0) return [0, 0, 0, 0, 0];
  return times.map(t => parseFloat(((t / total) * 100).toFixed(2)));
}

/**
 * HR Efficiency Factor (EF): Ratio of Normalized Power (W) / Avg HR, or Speed (m/min) / Avg HR
 * Standard in running is Speed in m/min divided by Avg HR
 */
export function calculateHREfficiency(activity: CanonicalActivity): number | null {
  if (!activity.averageHeartRateBpm || activity.averageHeartRateBpm <= 0) return null;
  const speedMpm = activity.averageSpeedMps * 60; // m/min
  return parseFloat((speedMpm / activity.averageHeartRateBpm).toFixed(4));
}

/**
 * Aerobic Decoupling (Pa:Hr or Pw:Hr): Compares the ratio of Speed/Power to HR in 1st vs 2nd half.
 * Decoupling % = ((Ratio1 - Ratio2) / Ratio1) * 100
 */
export function calculateHRDecoupling(activity: CanonicalActivity, stream?: CanonicalStream): number | null {
  if (!stream || !stream.heartRateBpm || !stream.velocityMps || stream.heartRateBpm.length < 240) {
    return null; // Need at least 4 minutes
  }

  const len = stream.heartRateBpm.length;
  const mid = Math.floor(len / 2);

  const getHalfRatio = (start: number, end: number) => {
    let speedSum = 0;
    let hrSum = 0;
    let count = 0;

    for (let i = start; i < end; i++) {
      const v = stream.velocityMps?.[i];
      const h = stream.heartRateBpm?.[i];
      if (typeof v === 'number' && typeof h === 'number' && h > 30) {
        speedSum += v;
        hrSum += h;
        count++;
      }
    }

    if (count === 0 || hrSum === 0) return 0;
    const avgSpeed = speedSum / count;
    const avgHr = hrSum / count;
    return avgSpeed / avgHr;
  };

  const ratio1 = getHalfRatio(0, mid);
  const ratio2 = getHalfRatio(mid, len);

  if (ratio1 === 0 || ratio2 === 0) return null;

  const decoupling = ((ratio1 - ratio2) / ratio1) * 100;
  return parseFloat(decoupling.toFixed(2));
}

/**
 * Aerobic Ratio: percentage of time spent below aerobic threshold (80% of max HR)
 */
export function calculateAerobicRatio(activity: CanonicalActivity, athlete: CanonicalAthlete, stream?: CanonicalStream): number {
  const maxHr = athlete.maxHeartRateBpm || activity.maxHeartRateBpm || 190;
  const aerobicThresh = maxHr * 0.80;

  if (stream && stream.heartRateBpm && stream.heartRateBpm.length > 0) {
    const below = stream.heartRateBpm.filter(h => h > 30 && h <= aerobicThresh).length;
    const total = stream.heartRateBpm.filter(h => h > 30).length;
    return total > 0 ? parseFloat(((below / total) * 100).toFixed(2)) : 0;
  }

  const avg = activity.averageHeartRateBpm || 140;
  return avg <= aerobicThresh ? 100 : 0;
}

/**
 * Anaerobic Ratio: percentage of time spent above anaerobic threshold (90% of max HR)
 */
export function calculateAnaerobicRatio(activity: CanonicalActivity, athlete: CanonicalAthlete, stream?: CanonicalStream): number {
  const maxHr = athlete.maxHeartRateBpm || activity.maxHeartRateBpm || 190;
  const anaerobicThresh = maxHr * 0.90;

  if (stream && stream.heartRateBpm && stream.heartRateBpm.length > 0) {
    const above = stream.heartRateBpm.filter(h => h >= anaerobicThresh).length;
    const total = stream.heartRateBpm.filter(h => h > 30).length;
    return total > 0 ? parseFloat(((above / total) * 100).toFixed(2)) : 0;
  }

  const avg = activity.averageHeartRateBpm || 140;
  return avg >= anaerobicThresh ? 100 : 0;
}
