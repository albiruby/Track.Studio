import { CanonicalActivity, CanonicalStream } from '@/lib/data-platform/canonical/types';

export const FORMULA_VERSION = '1.0.0';

/**
 * Calculates Climbing Rate (VAM = Vertical Ascent in meters per hour)
 */
export function calculateClimbingRate(activity: CanonicalActivity): number {
  if (activity.movingTimeSec <= 0 || !activity.elevationGainMeters) return 0;
  const hours = activity.movingTimeSec / 3600;
  return parseFloat((activity.elevationGainMeters / hours).toFixed(2));
}

/**
 * Calculates Descending Rate (meters per hour)
 */
export function calculateDescendingRate(activity: CanonicalActivity): number {
  if (activity.movingTimeSec <= 0 || !activity.elevationLossMeters) return 0;
  const hours = activity.movingTimeSec / 3600;
  return parseFloat((activity.elevationLossMeters / hours).toFixed(2));
}

/**
 * Calculates average grade (%) over the whole activity
 */
export function calculateAverageGrade(activity: CanonicalActivity): number {
  if (activity.distanceMeters <= 0 || !activity.elevationGainMeters) return 0;
  // Grade % = (Elevation Gain / Distance) * 100
  return parseFloat(((activity.elevationGainMeters / activity.distanceMeters) * 100).toFixed(2));
}

/**
 * Calculates max grade (%) from streams if available
 */
export function calculateMaxGrade(activity: CanonicalActivity, stream?: CanonicalStream): number {
  if (stream && stream.altitudeMeters && stream.distanceMeters && stream.altitudeMeters.length > 1) {
    let maxGrade = 0;
    // Calculate grade over 10-meter windows to avoid sensor noise
    const dists = stream.distanceMeters;
    const alts = stream.altitudeMeters;
    
    for (let i = 10; i < alts.length; i += 5) {
      const dDist = dists[i] - dists[i - 10];
      const dAlt = alts[i] - alts[i - 10];
      if (dDist > 5) { // Ensure substantial distance step
        const grade = (dAlt / dDist) * 100;
        if (grade > maxGrade) maxGrade = grade;
      }
    }
    return parseFloat(maxGrade.toFixed(2));
  }
  // Standard fallback
  return 0;
}

/**
 * Calculates Vertical Speed (meters per second)
 */
export function calculateVerticalSpeed(activity: CanonicalActivity): number {
  if (activity.movingTimeSec <= 0 || !activity.elevationGainMeters) return 0;
  return parseFloat((activity.elevationGainMeters / activity.movingTimeSec).toFixed(4));
}

/**
 * Calculates Elevation Density (meters of ascent per kilometer of distance)
 */
export function calculateElevationDensity(activity: CanonicalActivity): number {
  if (activity.distanceMeters <= 0 || !activity.elevationGainMeters) return 0;
  const km = activity.distanceMeters / 1000;
  return parseFloat((activity.elevationGainMeters / km).toFixed(2));
}
