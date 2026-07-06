import { CanonicalActivity } from '@/lib/data-platform/canonical/types';
import { calculateCV, calculateStandardDeviation, parseToTimestamp } from './utils';

export const FORMULA_VERSION = '1.0.0';

/**
 * Helper to group activities by ISO week (YYYY-WW)
 */
function getActivitiesByWeek(activities: CanonicalActivity[]): Map<string, CanonicalActivity[]> {
  const weeklyMap = new Map<string, CanonicalActivity[]>();
  
  for (const act of activities) {
    if (!act.startDate) continue;
    const date = new Date(act.startDate);
    if (isNaN(date.getTime())) continue;

    // Calculate ISO Week or simple week number
    const tempDate = new Date(date.valueOf());
    tempDate.setDate(tempDate.getDate() - ((date.getDay() + 6) % 7)); // Monday
    const weekKey = tempDate.toISOString().slice(0, 10); // Start of week

    const existing = weeklyMap.get(weekKey) || [];
    existing.push(act);
    weeklyMap.set(weekKey, existing);
  }

  return weeklyMap;
}

/**
 * Helper to group activities by Month (YYYY-MM)
 */
function getActivitiesByMonth(activities: CanonicalActivity[]): Map<string, CanonicalActivity[]> {
  const monthlyMap = new Map<string, CanonicalActivity[]>();

  for (const act of activities) {
    if (!act.startDate) continue;
    const date = new Date(act.startDate);
    if (isNaN(date.getTime())) continue;

    const monthKey = act.startDate.slice(0, 7); // YYYY-MM
    const existing = monthlyMap.get(monthKey) || [];
    existing.push(act);
    monthlyMap.set(monthKey, existing);
  }

  return monthlyMap;
}

/**
 * Weekly Consistency
 * Fraction of weeks in the range with at least minWorkouts per week.
 */
export function calculateWeeklyConsistency(activities: CanonicalActivity[], minWorkouts = 1): number {
  if (activities.length === 0) return 0;
  
  const weeklyMap = getActivitiesByWeek(activities);
  const activeWeeksCount = weeklyMap.size;
  if (activeWeeksCount === 0) return 0;

  let consistentWeeks = 0;
  for (const [, weekActs] of weeklyMap) {
    if (weekActs.length >= minWorkouts) {
      consistentWeeks++;
    }
  }

  return parseFloat(((consistentWeeks / activeWeeksCount) * 100).toFixed(2));
}

/**
 * Monthly Consistency
 * Fraction of months in the range with at least minWorkouts.
 */
export function calculateMonthlyConsistency(activities: CanonicalActivity[], minWorkouts = 4): number {
  if (activities.length === 0) return 0;

  const monthlyMap = getActivitiesByMonth(activities);
  const activeMonthsCount = monthlyMap.size;
  if (activeMonthsCount === 0) return 0;

  let consistentMonths = 0;
  for (const [, monthActs] of monthlyMap) {
    if (monthActs.length >= minWorkouts) {
      consistentMonths++;
    }
  }

  return parseFloat(((consistentMonths / activeMonthsCount) * 100).toFixed(2));
}

/**
 * Training Frequency (Workouts per week)
 */
export function calculateTrainingFrequency(activities: CanonicalActivity[]): number {
  if (activities.length === 0) return 0;

  const weeklyMap = getActivitiesByWeek(activities);
  if (weeklyMap.size === 0) return 0;

  const counts = Array.from(weeklyMap.values()).map(w => w.length);
  const total = counts.reduce((a, b) => a + b, 0);
  return parseFloat((total / counts.length).toFixed(2));
}

/**
 * Volume Stability (Coefficient of variation of weekly running distance)
 * Low CV (<0.15) means highly stable weekly volume.
 */
export function calculateVolumeStability(activities: CanonicalActivity[]): number {
  if (activities.length === 0) return 0;

  const weeklyMap = getActivitiesByWeek(activities);
  if (weeklyMap.size <= 1) return 1.0; // Minimal baseline variance

  const weeklyDistances = Array.from(weeklyMap.values()).map(weekActs => {
    return weekActs.reduce((sum, a) => sum + a.distanceMeters, 0);
  });

  return parseFloat(calculateCV(weeklyDistances).toFixed(4));
}

/**
 * Intensity Stability (Coefficient of variation of weekly average heart rate)
 */
export function calculateIntensityStability(activities: CanonicalActivity[]): number {
  if (activities.length === 0) return 0;

  const weeklyMap = getActivitiesByWeek(activities);
  if (weeklyMap.size <= 1) return 1.0;

  const weeklyAvgHrs = Array.from(weeklyMap.values()).map(weekActs => {
    const hrs = weekActs.map(a => a.averageHeartRateBpm).filter((h): h is number => typeof h === 'number');
    return hrs.length > 0 ? hrs.reduce((a, b) => a + b, 0) / hrs.length : null;
  }).filter((h): h is number => h !== null);

  if (weeklyAvgHrs.length <= 1) return 0;
  return parseFloat(calculateCV(weeklyAvgHrs).toFixed(4));
}

/**
 * Recovery Consistency (Coefficient of variation of rest interval duration between consecutive sessions)
 */
export function calculateRecoveryConsistency(activities: CanonicalActivity[]): number {
  if (activities.length < 3) return 0;

  // Sort by date ascending
  const sorted = [...activities].sort((a, b) => parseToTimestamp(a.startDate) - parseToTimestamp(b.startDate));
  const restDays: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = parseToTimestamp(sorted[i - 1].startDate) + (sorted[i - 1].elapsedTimeSec * 1000);
    const nextStart = parseToTimestamp(sorted[i].startDate);
    const diffMs = nextStart - prevEnd;
    const diffDays = Math.max(0, diffMs / (1000 * 3600 * 24));
    restDays.push(diffDays);
  }

  return parseFloat(calculateCV(restDays).toFixed(4));
}

/**
 * Load Consistency (Coefficient of variation of weekly TSS/load)
 */
export function calculateLoadConsistency(activities: CanonicalActivity[], athlete: CanonicalAthlete): number {
  if (activities.length === 0) return 0;

  const weeklyMap = getActivitiesByWeek(activities);
  if (weeklyMap.size <= 1) return 1.0;

  const weeklyLoads = Array.from(weeklyMap.values()).map(weekActs => {
    return weekActs.reduce((sum, act) => {
      // Approximate Load: if average HR is present, use standard stress score factor, else duration factor
      const hr = act.averageHeartRateBpm || 140;
      const rH = athlete.restingHeartRateBpm || 60;
      const mH = athlete.maxHeartRateBpm || 190;
      const hrr = (hr - rH) / (mH - rH);
      const intensity = hrr > 0 ? hrr : 0.6;
      const load = (act.movingTimeSec / 60) * intensity * 1.5;
      return sum + load;
    }, 0);
  });

  return parseFloat(calculateCV(weeklyLoads).toFixed(4));
}
