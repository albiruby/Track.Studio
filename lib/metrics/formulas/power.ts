import { CanonicalActivity, CanonicalStream, CanonicalAthlete } from '@/lib/data-platform/canonical/types';
import { rollingAverage } from './utils';

export const FORMULA_VERSION = '1.0.0';

/**
 * Basic Power values
 */
export function calculateAveragePower(activity: CanonicalActivity): number | null {
  return activity.averagePowerWatts;
}

export function calculateMaxPower(activity: CanonicalActivity): number | null {
  return activity.maxPowerWatts;
}

/**
 * Coggan Normalized Power (NP)
 * 1. 30-second rolling average of power stream
 * 2. Values raised to the 4th power
 * 3. Average of 4th powered values
 * 4. 4th root of the average
 */
export function calculateNormalizedPower(activity: CanonicalActivity, stream?: CanonicalStream): number | null {
  if (!stream || !stream.powerWatts || stream.powerWatts.length < 30) {
    // Fallback to average power * 1.05 if power is available but no stream
    return activity.averagePowerWatts !== null ? Math.round(activity.averagePowerWatts * 1.05) : null;
  }

  const power = stream.powerWatts;
  const smoothPower = rollingAverage(power, 30);
  
  // Raise to 4th power
  const fourthPowers = smoothPower.map(p => Math.pow(p, 4));
  
  // Average
  const sum = fourthPowers.reduce((a, b) => a + b, 0);
  const avg = sum / fourthPowers.length;
  
  // 4th root
  const np = Math.round(Math.pow(avg, 0.25));
  return isNaN(np) ? null : np;
}

/**
 * Variability Index (VI) = Normalized Power / Average Power
 */
export function calculatePowerVariabilityIndex(activity: CanonicalActivity, stream?: CanonicalStream): number | null {
  const avgPower = activity.averagePowerWatts;
  if (!avgPower || avgPower <= 0) return null;
  const np = calculateNormalizedPower(activity, stream);
  if (!np) return null;
  return parseFloat((np / avgPower).toFixed(4));
}

/**
 * Power Zones time in seconds (Z1-Z7 based on Coggan model)
 * Z1: <55% FTP, Z2: 55-75%, Z3: 75-90%, Z4: 90-105%, Z5: 105-120%, Z6: 120-150%, Z7: >150%
 */
export function calculateTimeInPowerZones(activity: CanonicalActivity, athlete: CanonicalAthlete, stream?: CanonicalStream): number[] {
  const ftp = athlete.ftpWatts || activity.averagePowerWatts || 250;
  
  const z1Max = ftp * 0.55;
  const z2Max = ftp * 0.75;
  const z3Max = ftp * 0.90;
  const z4Max = ftp * 1.05;
  const z5Max = ftp * 1.20;
  const z6Max = ftp * 1.50;

  let z1 = 0, z2 = 0, z3 = 0, z4 = 0, z5 = 0, z6 = 0, z7 = 0;

  if (stream && stream.powerWatts && stream.powerWatts.length > 0) {
    for (const w of stream.powerWatts) {
      if (w < z1Max) z1++;
      else if (w < z2Max) z2++;
      else if (w < z3Max) z3++;
      else if (w < z4Max) z4++;
      else if (w < z5Max) z5++;
      else if (w < z6Max) z6++;
      else z7++;
    }
  } else {
    // If no streams, put the moving time entirely in the average power zone
    const avg = activity.averagePowerWatts || ftp * 0.75;
    const dur = activity.movingTimeSec;
    if (avg < z1Max) z1 = dur;
    else if (avg < z2Max) z2 = dur;
    else if (avg < z3Max) z3 = dur;
    else if (avg < z4Max) z4 = dur;
    else if (avg < z5Max) z5 = dur;
    else if (avg < z6Max) z6 = dur;
    else z7 = dur;
  }

  return [z1, z2, z3, z4, z5, z6, z7];
}

/**
 * Power Zone distribution percentage
 */
export function calculatePowerZoneDistribution(activity: CanonicalActivity, athlete: CanonicalAthlete, stream?: CanonicalStream): number[] {
  const times = calculateTimeInPowerZones(activity, athlete, stream);
  const total = times.reduce((a, b) => a + b, 0);
  if (total === 0) return [0, 0, 0, 0, 0, 0, 0];
  return times.map(t => parseFloat(((t / total) * 100).toFixed(2)));
}

/**
 * Power Density (Watts/kg of athlete's weight)
 */
export function calculatePowerDensity(activity: CanonicalActivity, athlete: CanonicalAthlete): number | null {
  const weight = athlete.weightKg;
  const power = activity.averagePowerWatts;
  if (!weight || !power || weight <= 0) return null;
  return parseFloat((power / weight).toFixed(2));
}

/**
 * Power Balance (returns left/right balance percentage if supported, e.g. 50/50)
 * Often null since standard runs do not capture this, but defined as structure
 */
export function calculatePowerBalance(): { left: number; right: number } | null {
  return null; // Left/right balance is Cycling specific and rarely populated for running
}
