import { CanonicalActivity } from '@/lib/data-platform/canonical/types';
import { mpsToDecimalPace } from './utils';

export const FORMULA_VERSION = '1.0.0';

/**
 * Calculations for basic physical activity dimensions
 */

export function calculateMovingPace(activity: CanonicalActivity): number {
  if (activity.distanceMeters <= 0 || activity.movingTimeSec <= 0) return 0;
  const speed = activity.distanceMeters / activity.movingTimeSec;
  return mpsToDecimalPace(speed);
}

export function calculateElapsedPace(activity: CanonicalActivity): number {
  if (activity.distanceMeters <= 0 || activity.elapsedTimeSec <= 0) return 0;
  const speed = activity.distanceMeters / activity.elapsedTimeSec;
  return mpsToDecimalPace(speed);
}

export function calculateAverageSpeed(activity: CanonicalActivity): number {
  if (activity.elapsedTimeSec <= 0) return 0;
  return activity.distanceMeters / activity.elapsedTimeSec;
}

export function calculateMovingSpeed(activity: CanonicalActivity): number {
  if (activity.movingTimeSec <= 0) return 0;
  return activity.distanceMeters / activity.movingTimeSec;
}

export function calculateDistance(activity: CanonicalActivity): number {
  return Math.max(0, activity.distanceMeters);
}

export function calculateDuration(activity: CanonicalActivity): number {
  return Math.max(0, activity.movingTimeSec);
}

export function calculateElevationGain(activity: CanonicalActivity): number {
  return Math.max(0, activity.elevationGainMeters);
}

export function calculateElevationLoss(activity: CanonicalActivity): number {
  return Math.max(0, activity.elevationLossMeters);
}

export function calculateCalories(activity: CanonicalActivity): number {
  return activity.calories !== null ? Math.max(0, activity.calories) : 0;
}

export function calculateWork(activity: CanonicalActivity): number {
  // Work (kJ) = Average Power (Watts) * Duration (seconds) / 1000
  if (activity.averagePowerWatts === null || activity.movingTimeSec <= 0) {
    return activity.kilojoules !== null ? Math.max(0, activity.kilojoules) : 0;
  }
  return parseFloat(((activity.averagePowerWatts * activity.movingTimeSec) / 1000).toFixed(2));
}

export function calculateClimbRate(activity: CanonicalActivity): number {
  // m/hr
  if (activity.movingTimeSec <= 0 || activity.elevationGainMeters <= 0) return 0;
  const hours = activity.movingTimeSec / 3600;
  return parseFloat((activity.elevationGainMeters / hours).toFixed(2));
}

export function calculateDescentRate(activity: CanonicalActivity): number {
  // m/hr
  if (activity.movingTimeSec <= 0 || activity.elevationLossMeters <= 0) return 0;
  const hours = activity.movingTimeSec / 3600;
  return parseFloat((activity.elevationLossMeters / hours).toFixed(2));
}
