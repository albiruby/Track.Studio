import { ComputedMetric, MetricCategory } from './types';
import { MetricRegistry } from './registry';

export class MetricRepository {
  private metrics: ComputedMetric[] = [];

  /**
   * Saves a collection of computed metrics.
   */
  public save(computed: ComputedMetric[]): void {
    // Upsert logic: avoid duplicate metricId + activityId + athleteId combinations
    for (const item of computed) {
      const index = this.metrics.findIndex(
        m => m.metricId === item.metricId &&
             m.athleteId === item.athleteId &&
             m.activityId === item.activityId
      );

      if (index !== -1) {
        this.metrics[index] = item; // Update existing
      } else {
        this.metrics.push(item); // Insert new
      }
    }
  }

  /**
   * Retrieves all computed metrics for a specific activity.
   */
  public getByActivityId(activityId: string): ComputedMetric[] {
    return this.metrics.filter(m => m.activityId === activityId);
  }

  /**
   * Retrieves all computed metrics for a specific athlete.
   */
  public getByAthleteId(athleteId: string): ComputedMetric[] {
    return this.metrics.filter(m => m.athleteId === athleteId);
  }

  /**
   * Retrieves all computed metrics of a specific category for an athlete.
   */
  public getByCategory(athleteId: string, category: MetricCategory): ComputedMetric[] {
    return this.metrics.filter(m => {
      if (m.athleteId !== athleteId) return false;
      const def = MetricRegistry.get(m.metricId);
      return def !== undefined && def.category === category;
    });
  }

  /**
   * Retrieves the chronological trend of a specific metric (e.g. CTL or VO2Max over time).
   */
  public getMetricTrend(athleteId: string, metricId: string): { timestamp: string; value: any; activityId?: string }[] {
    return this.metrics
      .filter(m => m.athleteId === athleteId && m.metricId === metricId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(m => ({
        timestamp: m.timestamp,
        value: m.value,
        activityId: m.activityId
      }));
  }

  /**
   * Clears all stored metrics from the in-memory repository.
   */
  public clear(): void {
    this.metrics = [];
  }

  /**
   * Exports all metrics as a JSON array for external storage.
   */
  public exportToJSON(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * Imports metrics from a JSON array string.
   */
  public importFromJSON(jsonStr: string): void {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        this.save(parsed);
      }
    } catch (err) {
      console.error('Failed to import metrics from JSON:', err);
    }
  }
}
