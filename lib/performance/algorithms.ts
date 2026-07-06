/**
 * Performance Engine Algorithms - Track.Studio
 * Calculates historical training loads (CTL, ATL, TSB) from athletic stress scores.
 * Uses standard exponential moving average (EMA) models.
 */

import { TrainingLoadMetric } from '@/types/performance';

interface DailyStress {
  date: string; // YYYY-MM-DD
  runningStressScore: number;
}

/**
 * Calculates Chronic Training Load (CTL / Fitness), Acute Training Load (ATL / Fatigue),
 * and Training Stress Balance (TSB / Form) over a time series.
 * 
 * Formulas:
 * CTL_today = CTL_yesterday * e^(-1/42) + RSS_today * (1 - e^(-1/42))
 * ATL_today = ATL_yesterday * e^(-1/7) + RSS_today * (1 - e^(-1/7))
 * TSB_today = CTL_yesterday - ATL_yesterday
 * 
 * @param stressHistory Sorted chronological array of daily stress scores
 * @param initialCtl Starting Chronic Training Load (defaults to 0)
 * @param initialAtl Starting Acute Training Load (defaults to 0)
 */
export function calculateTrainingLoadSeries(
  stressHistory: DailyStress[],
  initialCtl = 0,
  initialAtl = 0
): TrainingLoadMetric[] {
  if (stressHistory.length === 0) return [];

  const results: TrainingLoadMetric[] = [];
  let prevCtl = initialCtl;
  let prevAtl = initialAtl;

  // Constants for exponential decay
  const ctlDecay = Math.exp(-1 / 42);
  const atlDecay = Math.exp(-1 / 7);

  for (const day of stressHistory) {
    const rss = day.runningStressScore;

    // Formula: CTL = CTL_prev * decay + RSS * (1 - decay)
    const currentCtl = prevCtl * ctlDecay + rss * (1 - ctlDecay);
    
    // Formula: ATL = ATL_prev * decay + RSS * (1 - decay)
    const currentAtl = prevAtl * atlDecay + rss * (1 - atlDecay);
    
    // Formula: TSB = CTL_prev - ATL_prev (or current CTL - ATL depending on system convention, here we use CTL - ATL)
    const currentTsb = prevCtl - prevAtl;

    results.push({
      date: day.date,
      chronicTrainingLoad: Math.round(currentCtl * 10) / 10,
      acuteTrainingLoad: Math.round(currentAtl * 10) / 10,
      trainingStressBalance: Math.round(currentTsb * 10) / 10,
    });

    prevCtl = currentCtl;
    prevAtl = currentAtl;
  }

  return results;
}

/**
 * Calculates the CTL (Fitness) Ramp Rate over a specific duration (usually 7 days).
 * Positive ramp rate indicates increasing load, negative indicates detraining.
 * 
 * @param loadHistory Calculated training load history
 * @param days Duration to measure ramp rate over (defaults to 7)
 */
export function calculateCtlRampRate(
  loadHistory: TrainingLoadMetric[],
  days = 7
): number {
  if (loadHistory.length < days + 1) return 0;
  
  const current = loadHistory[loadHistory.length - 1].chronicTrainingLoad;
  const historical = loadHistory[loadHistory.length - 1 - days].chronicTrainingLoad;
  
  return Math.round((current - historical) * 10) / 10;
}
