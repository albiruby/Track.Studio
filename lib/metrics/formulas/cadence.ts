import { CanonicalActivity, CanonicalStream } from '@/lib/data-platform/canonical/types';
import { calculateStandardDeviation } from './utils';

export const FORMULA_VERSION = '1.0.0';

/**
 * Basic Cadence values
 */
export function calculateAverageCadence(activity: CanonicalActivity): number | null {
  return activity.averageCadenceRpm;
}

export function calculateMaxCadence(activity: CanonicalActivity): number | null {
  return activity.maxCadenceRpm;
}

/**
 * Stride Frequency (Steps per minute = Cadence RPM * 2)
 * In running, cadence is often expressed as single-foot (RPM, e.g. 90) or double-foot (SPM, e.g. 180)
 */
export function calculateStrideFrequency(activity: CanonicalActivity): number | null {
  if (!activity.averageCadenceRpm) return null;
  return activity.averageCadenceRpm * 2;
}

/**
 * Cadence Stability: standard deviation of the cadence stream
 */
export function calculateCadenceStability(stream: CanonicalStream): number | null {
  if (!stream.cadenceRpm || stream.cadenceRpm.length < 10) return null;
  const validCadences = stream.cadenceRpm.filter(c => c > 30);
  if (validCadences.length === 0) return null;
  return parseFloat(calculateStandardDeviation(validCadences).toFixed(2));
}

/**
 * Cadence Distribution over standard brackets:
 * <75, 75-80, 80-85, 85-90, 90-95, >95 rpm (revolutions/min, multiply by 2 for spm steps)
 */
export function calculateCadenceDistribution(activity: CanonicalActivity, stream?: CanonicalStream): { bracket: string; seconds: number; percentage: number }[] {
  const brackets = [
    { name: '<75', min: 0, max: 74 },
    { name: '75-80', min: 75, max: 79 },
    { name: '80-85', min: 80, max: 84 },
    { name: '85-90', min: 85, max: 89 },
    { name: '90-95', min: 90, max: 94 },
    { name: '>95', min: 95, max: 250 }
  ];

  const counts = brackets.map(() => 0);

  if (stream && stream.cadenceRpm && stream.cadenceRpm.length > 0) {
    const validCadences = stream.cadenceRpm.filter(c => c > 10);
    for (const c of validCadences) {
      for (let i = 0; i < brackets.length; i++) {
        if (c >= brackets[i].min && c <= brackets[i].max) {
          counts[i]++;
          break;
        }
      }
    }
  } else {
    // Distribute moving time to the bracket of average cadence
    const avg = activity.averageCadenceRpm || 85;
    const dur = activity.movingTimeSec;
    for (let i = 0; i < brackets.length; i++) {
      if (avg >= brackets[i].min && avg <= brackets[i].max) {
        counts[i] = dur;
        break;
      }
    }
  }

  const total = counts.reduce((a, b) => a + b, 0);

  return brackets.map((b, i) => ({
    bracket: b.name,
    seconds: counts[i],
    percentage: total > 0 ? parseFloat(((counts[i] / total) * 100).toFixed(2)) : 0
  }));
}
