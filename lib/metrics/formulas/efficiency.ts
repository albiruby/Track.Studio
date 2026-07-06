import { CanonicalActivity, CanonicalAthlete, CanonicalStream } from '@/lib/data-platform/canonical/types';
import { calculateNormalizedPower } from './power';

export const FORMULA_VERSION = '1.0.0';

/**
 * Running Effectiveness (RE)
 * RE = Speed (m/s) / (Power (W) / Weight (kg))
 * Measures how effectively runner converts electrical/metabolic power to forward speed.
 * Typical values range from 0.95 to 1.05.
 */
export function calculateRunningEffectiveness(activity: CanonicalActivity, athlete: CanonicalAthlete): number | null {
  const speed = activity.averageSpeedMps;
  const power = activity.averagePowerWatts;
  const weight = athlete.weightKg;

  if (!speed || !power || !weight || weight <= 0 || power <= 0) return null;
  
  const powerPerKg = power / weight;
  const re = speed / powerPerKg;
  return parseFloat(re.toFixed(4));
}

/**
 * Efficiency Factor (EF)
 * If Power is present: EF = Normalized Power (W) / Avg HR (bpm)
 * If only Speed is present: EF = Speed (meters/minute) / Avg HR (bpm)
 */
export function calculateEfficiencyFactor(activity: CanonicalActivity, athlete: CanonicalAthlete, stream?: CanonicalStream): number | null {
  const avgHr = activity.averageHeartRateBpm;
  if (!avgHr || avgHr <= 0) return null;

  const power = activity.averagePowerWatts;
  if (power !== null && power > 0) {
    const np = calculateNormalizedPower(activity, stream) || power;
    return parseFloat((np / avgHr).toFixed(4));
  }

  // Speed-based EF: speed in meters per minute / HR
  const speedMpm = activity.averageSpeedMps * 60;
  return parseFloat((speedMpm / avgHr).toFixed(4));
}

/**
 * Speed / HR ratio (meters/second per bpm)
 */
export function calculateSpeedToHRRatio(activity: CanonicalActivity): number | null {
  const speed = activity.averageSpeedMps;
  const hr = activity.averageHeartRateBpm;
  if (!speed || !hr || hr <= 0) return null;
  return parseFloat((speed / hr).toFixed(4));
}

/**
 * Pace / HR ratio (decimal min/km per bpm)
 */
export function calculatePaceToHRRatio(activity: CanonicalActivity): number | null {
  const pace = activity.averagePaceMinPerKm;
  const hr = activity.averageHeartRateBpm;
  if (!pace || !hr || hr <= 0) return null;
  return parseFloat((pace / hr).toFixed(4));
}

/**
 * Power / Pace ratio (Watts per min/km)
 */
export function calculatePowerToPaceRatio(activity: CanonicalActivity): number | null {
  const power = activity.averagePowerWatts;
  const pace = activity.averagePaceMinPerKm;
  if (!power || !pace || pace <= 0) return null;
  return parseFloat((power / pace).toFixed(4));
}

/**
 * Power / Speed ratio (Watts per m/s)
 */
export function calculatePowerToSpeedRatio(activity: CanonicalActivity): number | null {
  const power = activity.averagePowerWatts;
  const speed = activity.averageSpeedMps;
  if (!power || !speed || speed <= 0) return null;
  return parseFloat((power / speed).toFixed(4));
}

/**
 * Cadence / Speed ratio (steps per meter)
 */
export function calculateCadenceToSpeedRatio(activity: CanonicalActivity): number | null {
  const cadence = activity.averageCadenceRpm; // rpm (one foot)
  const speed = activity.averageSpeedMps;
  if (!cadence || !speed || speed <= 0) return null;
  // Steps/min = cadence * 2. Speed = m/s. Steps per meter = (steps/60) / speed
  const stepsPerSecond = (cadence * 2) / 60;
  return parseFloat((stepsPerSecond / speed).toFixed(4));
}

/**
 * Stride Length (meters per step)
 * Formula: Stride Length = Speed (m/s) / (Cadence (RPM) * 2 / 60)
 */
export function calculateStrideLength(activity: CanonicalActivity): number | null {
  const speed = activity.averageSpeedMps;
  const cadence = activity.averageCadenceRpm;
  if (!speed || !cadence || cadence <= 0) return null;
  
  const stepsPerSec = (cadence * 2) / 60;
  return parseFloat((speed / stepsPerSec).toFixed(3));
}

/**
 * Stride Efficiency
 * Standard running metric: Stride Length (meters) divided by heart rate (bpm)
 */
export function calculateStrideEfficiency(activity: CanonicalActivity): number | null {
  const strideLen = calculateStrideLength(activity);
  const hr = activity.averageHeartRateBpm;
  if (!strideLen || !hr || hr <= 0) return null;
  return parseFloat((strideLen / hr).toFixed(4));
}
