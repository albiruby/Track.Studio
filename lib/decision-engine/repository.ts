import { Decision, DecisionCategory, SeverityLevel } from './types';

export class DecisionRepository {
  private decisions: Decision[] = [];

  /**
   * Saves or updates a collection of decisions.
   * Leverages upsert logic to avoid duplicate decisionIds or (athleteId + activityId + category + name) combinations.
   */
  public save(newDecisions: Decision[]): void {
    for (const item of newDecisions) {
      const index = this.decisions.findIndex(
        d => d.decisionId === item.decisionId || (
          d.athleteId === item.athleteId &&
          d.activityId === item.activityId &&
          d.category === item.category &&
          d.name === item.name
        )
      );

      if (index !== -1) {
        this.decisions[index] = item; // Update
      } else {
        this.decisions.push(item); // Insert
      }
    }
  }

  /**
   * Retrieves all decisions.
   */
  public getAll(): Decision[] {
    return [...this.decisions];
  }

  /**
   * Retrieves decisions for a specific activity.
   */
  public getByActivityId(activityId: string): Decision[] {
    return this.decisions.filter(d => d.activityId === activityId);
  }

  /**
   * Retrieves decisions for a specific athlete.
   */
  public getByAthleteId(athleteId: string): Decision[] {
    return this.decisions.filter(d => d.athleteId === athleteId);
  }

  /**
   * Retrieves decisions by category for a specific athlete.
   */
  public getByCategory(athleteId: string, category: DecisionCategory): Decision[] {
    return this.decisions.filter(d => d.athleteId === athleteId && d.category === category);
  }

  /**
   * Retrieves decisions by severity level.
   */
  public getBySeverity(athleteId: string, severity: SeverityLevel): Decision[] {
    return this.decisions.filter(d => d.athleteId === athleteId && d.severity === severity);
  }

  /**
   * Retrieves decisions by outcome status label.
   */
  public getByStatus(athleteId: string, status: string): Decision[] {
    return this.decisions.filter(d => d.athleteId === athleteId && d.status.toLowerCase() === status.toLowerCase());
  }

  /**
   * Query decisions by a specific date range.
   */
  public getByDateRange(athleteId: string, startDate: Date, endDate: Date): Decision[] {
    const startMs = startDate.getTime();
    const endMs = endDate.getTime();

    return this.decisions.filter(d => {
      if (d.athleteId !== athleteId) return false;
      const ts = new Date(d.generatedTimestamp).getTime();
      return ts >= startMs && ts <= endMs;
    });
  }

  /**
   * Retrieves the chronological trend of scores or status outcomes for a specific rule/decision category.
   */
  public getDecisionTrend(athleteId: string, category: DecisionCategory): { timestamp: string; score: number; status: string; activityId?: string }[] {
    return this.decisions
      .filter(d => d.athleteId === athleteId && d.category === category)
      .sort((a, b) => new Date(a.generatedTimestamp).getTime() - new Date(b.generatedTimestamp).getTime())
      .map(d => ({
        timestamp: d.generatedTimestamp,
        score: d.score,
        status: d.status,
        activityId: d.activityId
      }));
  }

  /**
   * Clears all decisions from the repository.
   */
  public clear(): void {
    this.decisions = [];
  }

  /**
   * Exports all stored decisions to a JSON array string.
   */
  public exportToJSON(): string {
    return JSON.stringify(this.decisions, null, 2);
  }

  /**
   * Imports decisions from a JSON array string.
   */
  public importFromJSON(jsonStr: string): void {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        this.save(parsed);
      }
    } catch (err) {
      console.error('[DecisionRepository] Failed to import decisions from JSON:', err);
    }
  }
}
