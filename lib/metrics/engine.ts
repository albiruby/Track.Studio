import { CanonicalActivity, CanonicalAthlete, CanonicalStream, CanonicalSplit } from '@/lib/data-platform/canonical/types';
import { ComputedMetric, MetricCategory } from './types';
import { MetricRegistry } from './registry';

export class MetricEngine {
  /**
   * Evaluates all applicable single-activity metrics for a given activity, athlete, and optional streams/splits.
   * Returns a collection of fully traceable ComputedMetric records.
   */
  public static evaluateActivity(params: {
    activity: CanonicalActivity;
    athlete: CanonicalAthlete;
    stream?: CanonicalStream;
    splits?: CanonicalSplit[];
    metricIds?: string[]; // Optional specific metrics to calculate. If omitted, calculates all active single-activity metrics.
  }): ComputedMetric[] {
    const { activity, athlete, stream, splits, metricIds } = params;
    const computed: ComputedMetric[] = [];
    const timestamp = new Date().toISOString();

    // Determine target metrics
    const targets = metricIds 
      ? metricIds.map(id => MetricRegistry.get(id)).filter((m): m is any => m !== undefined)
      : MetricRegistry.list().filter(m => m.category !== 'consistency' && m.category !== 'recovery' && m.metricId !== 'personal_bests' && m.metricId !== 'peak_week' && m.metricId !== 'peak_month');

    for (const def of targets) {
      try {
        // Evaluate the formula
        const value = def.calculate({
          activity,
          athlete,
          stream,
          splits
        });

        // Skip null values (e.g., if a sensor was not present)
        if (value === null || value === undefined) {
          continue;
        }

        computed.push({
          metricId: def.metricId,
          athleteId: athlete.id,
          activityId: activity.id,
          value,
          units: def.units,
          formulaVersion: def.version,
          metricVersion: '1.0.0', // engine mapping version
          timestamp,
          inputReferences: [
            `activity:${activity.id}`,
            ...def.dependencies.map((d: string) => `activity.fields:${d}`),
            ...(stream ? [`stream:${activity.id}`] : []),
            ...(splits ? [`splits:${activity.id}`] : [])
          ]
        });
      } catch (err) {
        console.error(`Error calculating metric "${def.metricId}" for activity "${activity.id}":`, err);
        // We gracefully continue rather than crashing the engine, preserving stability
      }
    }

    return computed;
  }

  /**
   * Evaluates athletic trends, loads, consistencies, and performance indexes over a multi-activity training history.
   */
  public static evaluateAthleteHistory(params: {
    history: CanonicalActivity[];
    athlete: CanonicalAthlete;
    metricIds?: string[];
  }): ComputedMetric[] {
    const { history, athlete, metricIds } = params;
    const computed: ComputedMetric[] = [];
    const timestamp = new Date().toISOString();

    // Filter multi-activity / trend categories
    const targets = metricIds
      ? metricIds.map(id => MetricRegistry.get(id)).filter((m): m is any => m !== undefined)
      : MetricRegistry.list().filter(m => m.category === 'consistency' || m.category === 'recovery' || m.metricId === 'personal_bests' || m.metricId === 'peak_week' || m.metricId === 'peak_month' || m.metricId === 'athlete_vo2max');

    const sortedHistory = [...history].sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    for (const def of targets) {
      try {
        // Provide dummy/empty activity object as parameter because multi-activity calculations consume the history
        const mockActivity: CanonicalActivity = sortedHistory[sortedHistory.length - 1] || {} as any;

        const value = def.calculate({
          activity: mockActivity,
          athlete,
          history: sortedHistory
        });

        if (value === null || value === undefined) {
          continue;
        }

        computed.push({
          metricId: def.metricId,
          athleteId: athlete.id,
          value,
          units: def.units,
          formulaVersion: def.version,
          metricVersion: '1.0.0',
          timestamp,
          inputReferences: [
            `athlete:${athlete.id}`,
            `history.count:${history.length}`,
            ...sortedHistory.slice(-5).map((a: CanonicalActivity) => `activity:${a.id}`) // Traceability back to the most recent activities
          ]
        });
      } catch (err) {
        console.error(`Error calculating trend metric "${def.metricId}" for athlete "${athlete.id}":`, err);
      }
    }

    return computed;
  }
}
