import { CanonicalActivity, CanonicalAthlete, CanonicalBestEffort } from '@/lib/data-platform/canonical/types';
import { parseToTimestamp } from './utils';

export const FORMULA_VERSION = '1.0.0';

/**
 * Estimates athlete VO2Max using Uth-Sørensen-Overgaard-Pedersen formula
 * VO2Max = 15.3 * (Max HR / Resting HR)
 * If Max/Resting HR is missing, returns null.
 */
export function estimateAthleteVO2Max(athlete: CanonicalAthlete): number | null {
  if (athlete.maxHeartRateBpm && athlete.restingHeartRateBpm && athlete.restingHeartRateBpm > 0) {
    const vo2 = 15.3 * (athlete.maxHeartRateBpm / athlete.restingHeartRateBpm);
    return parseFloat(vo2.toFixed(2));
  }
  return athlete.vO2Max || null;
}

/**
 * Estimates Submaximal VO2Max from a single running activity (using HR & Pace ratio)
 * Based on Oxygen cost of running vs heart rate ratio.
 * VO2Max = 15.3 * (Max HR / Avg HR) * (Avg Speed / 4.7 mps for VO2Max pace proxy)
 */
export function estimateActivityVO2Max(activity: CanonicalActivity, athlete: CanonicalAthlete): number | null {
  const avgHr = activity.averageHeartRateBpm;
  const maxHr = athlete.maxHeartRateBpm || activity.maxHeartRateBpm || 190;
  const restingHr = athlete.restingHeartRateBpm || 60;
  const speed = activity.averageSpeedMps;

  if (!avgHr || !speed || speed <= 0 || avgHr <= restingHr) return null;

  // Percentage of HR Reserve used
  const hrReserve = maxHr - restingHr;
  if (hrReserve <= 0) return null;
  const hrFraction = (avgHr - restingHr) / hrReserve;

  // VO2Max can be approximated by estimating VO2 at the current speed and dividing by fractional HR intensity.
  // Oxygen cost of flat running is approx 0.2 ml/kg/m. Resting cost is 3.5 ml/kg/min.
  // VO2 (ml/kg/min) = 0.2 * speed (meters/min) + 3.5
  const speedMpm = speed * 60;
  const vo2Current = (0.2 * speedMpm) + 3.5;
  
  if (hrFraction < 0.40) return null; // Too low intensity for submaximal estimation

  const estimatedVo2Max = vo2Current / hrFraction;
  
  // Constrain to realistic human limits (25 to 85 ml/kg/min)
  if (estimatedVo2Max < 25 || estimatedVo2Max > 85) return null;

  return parseFloat(estimatedVo2Max.toFixed(2));
}

/**
 * Finds Personal Bests for standard distances (e.g. 5k, 10k, etc.) from a collection of activities
 */
export function findPersonalBests(activities: CanonicalActivity[]): Record<string, { timeSec: number; date: string; activityId: string }> {
  const records: Record<string, { timeSec: number; date: string; activityId: string }> = {};

  for (const act of activities) {
    for (const effort of act.bestEfforts) {
      const name = effort.name;
      const currentPB = records[name];
      if (!currentPB || effort.elapsedTimeSec < currentPB.timeSec) {
        records[name] = {
          timeSec: effort.elapsedTimeSec,
          date: act.startDate,
          activityId: act.id
        };
      }
    }
  }

  return records;
}

/**
 * Finds the peak training week (by distance) in a date range
 */
export function findPeakWeek(activities: CanonicalActivity[]): { weekOf: string; distanceMeters: number } | null {
  if (activities.length === 0) return null;

  const weeklyMap = new Map<string, number>();

  for (const act of activities) {
    const date = new Date(act.startDate);
    if (isNaN(date.getTime())) continue;

    const tempDate = new Date(date.valueOf());
    tempDate.setDate(tempDate.getDate() - ((date.getDay() + 6) % 7)); // Monday
    const weekKey = tempDate.toISOString().slice(0, 10);

    const distance = weeklyMap.get(weekKey) || 0;
    weeklyMap.set(weekKey, distance + act.distanceMeters);
  }

  let peakWeek: string | null = null;
  let maxDist = 0;

  for (const [week, dist] of weeklyMap) {
    if (dist > maxDist) {
      maxDist = dist;
      peakWeek = week;
    }
  }

  return peakWeek ? { weekOf: peakWeek, distanceMeters: maxDist } : null;
}

/**
 * Finds the peak training month (by distance) in a date range
 */
export function findPeakMonth(activities: CanonicalActivity[]): { month: string; distanceMeters: number } | null {
  if (activities.length === 0) return null;

  const monthlyMap = new Map<string, number>();

  for (const act of activities) {
    const monthKey = act.startDate.slice(0, 7); // YYYY-MM
    const distance = monthlyMap.get(monthKey) || 0;
    monthlyMap.set(monthKey, distance + act.distanceMeters);
  }

  let peakMonth: string | null = null;
  let maxDist = 0;

  for (const [month, dist] of monthlyMap) {
    if (dist > maxDist) {
      maxDist = dist;
      peakMonth = month;
    }
  }

  return peakMonth ? { month: peakMonth, distanceMeters: maxDist } : null;
}
