import { CanonicalActivity, CanonicalAthlete } from '@/lib/data-platform/canonical/types';
import { calculateTSS } from './load';
import { calculateStandardDeviation, calculateMean, parseToTimestamp } from './utils';

export const FORMULA_VERSION = '1.0.0';

export interface DailyPerformanceState {
  date: string; // YYYY-MM-DD
  load: number;
  ctl: number; // Fitness
  atl: number; // Fatigue
  tsb: number; // Form
  fatigueIndex: number;
}

/**
 * Calculates a daily timeline of CTL, ATL, and TSB from an array of activities.
 * Adheres to standard sport science equations:
 * CTL_t = CTL_t-1 + (Load_t - CTL_t-1) / 42
 * ATL_t = ATL_t-1 + (Load_t - ATL_t-1) / 7
 * TSB_t = CTL_t-1 - ATL_t-1 (Form is yesterday's fitness minus yesterday's fatigue)
 */
export function calculatePerformanceTrends(
  activities: CanonicalActivity[],
  athlete: CanonicalAthlete
): DailyPerformanceState[] {
  if (activities.length === 0) return [];

  // 1. Map activities to daily loads (TSS)
  const dailyLoadsMap = new Map<string, number>();
  let minTime = Infinity;
  let maxTime = -Infinity;

  for (const act of activities) {
    const timestamp = parseToTimestamp(act.startDate);
    if (!timestamp) continue;
    
    if (timestamp < minTime) minTime = timestamp;
    if (timestamp > maxTime) maxTime = timestamp;

    const dateKey = act.startDate.slice(0, 10); // YYYY-MM-DD
    const load = calculateTSS(act, athlete);
    const existingLoad = dailyLoadsMap.get(dateKey) || 0;
    dailyLoadsMap.set(dateKey, existingLoad + load);
  }

  if (minTime === Infinity) return [];

  // Generate date timeline from min Date to max Date (plus a 7-day padding for trend visualization if desired)
  const firstDate = new Date(minTime);
  firstDate.setUTCHours(0, 0, 0, 0);
  const lastDate = new Date(maxTime);
  lastDate.setUTCHours(0, 0, 0, 0);

  const timeline: DailyPerformanceState[] = [];
  const currentDate = new Date(firstDate);

  let ctl = 0;
  let atl = 0;

  // Track CTL and ATL on a daily basis
  while (currentDate <= lastDate) {
    const dateStr = currentDate.toISOString().slice(0, 10);
    const load = dailyLoadsMap.get(dateStr) || 0;

    // TSB is today's form, which is yesterday's fitness minus fatigue (pre-workout state)
    const tsb = ctl - atl;

    // Standard sports science time constants: CTL = 42 days, ATL = 7 days
    ctl = ctl + (load - ctl) / 42;
    atl = atl + (load - atl) / 7;

    const fatigueIndex = ctl > 0 ? atl / ctl : 0;

    timeline.push({
      date: dateStr,
      load: parseFloat(load.toFixed(1)),
      ctl: parseFloat(ctl.toFixed(2)),
      atl: parseFloat(atl.toFixed(2)),
      tsb: parseFloat(tsb.toFixed(2)),
      fatigueIndex: parseFloat(fatigueIndex.toFixed(2)),
    });

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return timeline;
}

/**
 * Calculates current CTL, ATL, TSB state at the end of the history
 */
export function calculateCurrentPerformanceState(
  activities: CanonicalActivity[],
  athlete: CanonicalAthlete
): { ctl: number; atl: number; tsb: number; fatigueIndex: number; status: string } {
  const trends = calculatePerformanceTrends(activities, athlete);
  if (trends.length === 0) {
    return { ctl: 0, atl: 0, tsb: 0, fatigueIndex: 0, status: 'Fresh' };
  }

  // Get last computed state
  const last = trends[trends.length - 1];
  
  // Classify TSB Form status:
  // > 15: Fresh / Transition
  // -10 to 15: Optimal Training (Sweet Spot)
  // -30 to -10: High Fatigue / Overreaching (Optimal adaptation if controlled)
  // < -30: Danger zone (Injury risk)
  let status = 'Fresh';
  if (last.tsb < -30) status = 'Danger (Overload)';
  else if (last.tsb < -10) status = 'Optimal Fatigue (Overreaching)';
  else if (last.tsb <= 15) status = 'Sweet Spot (Optimal)';
  else status = 'Fresh (Rested)';

  return {
    ctl: last.ctl,
    atl: last.atl,
    tsb: last.tsb,
    fatigueIndex: last.fatigueIndex,
    status
  };
}

/**
 * Calculates Weekly CTL Ramp Rate
 * Ideal ramp rate is +1 to +2 CTL per week to avoid injury.
 */
export function calculateCTLRampRate(
  activities: CanonicalActivity[],
  athlete: CanonicalAthlete
): number {
  const trends = calculatePerformanceTrends(activities, athlete);
  if (trends.length < 8) return 0; // Need at least 1 week
  
  const todayCtl = trends[trends.length - 1].ctl;
  const lastWeekCtl = trends[trends.length - 8].ctl; // 7 days ago
  
  return parseFloat((todayCtl - lastWeekCtl).toFixed(2));
}

/**
 * Training Monotony (over last 7 days of training)
 * Formula: Mean Daily Load / Standard Deviation of Daily Load
 * Monotony > 2.0 indicates high injury/overtraining risk due to lack of rest variation.
 */
export function calculateTrainingMonotony7Day(
  activities: CanonicalActivity[],
  athlete: CanonicalAthlete
): number {
  const trends = calculatePerformanceTrends(activities, athlete);
  if (trends.length < 7) return 1.0;

  const last7Days = trends.slice(-7).map(t => t.load);
  const mean = calculateMean(last7Days);
  if (mean === 0) return 1.0;
  
  const sd = calculateStandardDeviation(last7Days);
  if (sd === 0) return 1.0; // Avoid division by zero, monotony is stable

  return parseFloat((mean / sd).toFixed(2));
}

/**
 * Training Strain
 * Formula: Weekly Load * Training Monotony
 * Strain > 3000 indicates extreme risk of overtraining syndrome.
 */
export function calculateTrainingStrain7Day(
  activities: CanonicalActivity[],
  athlete: CanonicalAthlete
): number {
  const trends = calculatePerformanceTrends(activities, athlete);
  if (trends.length < 7) return 0;

  const last7Days = trends.slice(-7).map(t => t.load);
  const weeklyLoad = last7Days.reduce((a, b) => a + b, 0);
  const monotony = calculateTrainingMonotony7Day(activities, athlete);

  return parseFloat((weeklyLoad * monotony).toFixed(1));
}

/**
 * Estimated Recovery Time (Hours) required post-workout
 * Simple empirical zone-based estimation from TSS
 * TSS < 50: 12-24 hrs
 * TSS 50-100: 24-36 hrs
 * TSS 100-150: 36-48 hrs
 * TSS > 150: 48-72 hrs
 */
export function estimateRecoveryTimeHours(activity: CanonicalActivity, athlete: CanonicalAthlete): number {
  const load = calculateTSS(activity, athlete);
  if (load <= 0) return 0;
  
  // Power/exponential curve: Recovery hours = 24 * (TSS / 100) ^ 1.2
  const hours = 24 * Math.pow(load / 100, 1.2);
  // Cap recovery hours between 6 and 96 hours
  return Math.round(Math.min(96, Math.max(6, hours)));
}
