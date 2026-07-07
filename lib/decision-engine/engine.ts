import { Decision, DecisionEvaluationContext, DecisionCategory, SeverityLevel } from './types';
import { RuleRegistry, RuleRegistryEntry } from './rule-registry';
import { ComputedMetric } from '@/lib/metrics/types';
import { CanonicalActivity, CanonicalAthlete } from '@/lib/data-platform/canonical/types';

export class DecisionEngine {
  private static version = '1.0.0';

  /**
   * Retrieves the Decision Engine version.
   */
  public static getVersion(): string {
    return this.version;
  }

  /**
   * Evaluates the current athlete, activity, history, and calculated metrics
   * through all active rules in the registry.
   */
  public static evaluate(params: {
    athlete: CanonicalAthlete;
    activity?: CanonicalActivity;
    metrics: ComputedMetric[];
    history?: CanonicalActivity[];
  }): Decision[] {
    const { athlete, activity, metrics, history = [] } = params;
    const decisions: Decision[] = [];

    // 1. Fetch all active registered rules
    const activeRules = RuleRegistry.list().filter(r => r.definition.status === 'active');

    // 2. Sort rules by priority (ascending, so higher priority/more complex can run last and inspect previous decisions if needed)
    const sortedRules = [...activeRules].sort((a, b) => a.definition.priority - b.definition.priority);

    // 3. Evaluate each rule in sequence
    for (const rule of sortedRules) {
      try {
        const context: DecisionEvaluationContext = {
          athlete,
          activity,
          metrics,
          history,
          allDecisions: decisions // Pass accumulated decisions for any dependency resolution
        };

        const decision = rule.evaluate(context);
        if (decision) {
          decisions.push(decision);
        }
      } catch (err) {
        // Safe execution context: record failures but don't derail the whole engine
        console.error(`[DecisionEngine] Rule evaluation error in rule ${rule.definition.ruleId}:`, err);
      }
    }

    // 4. Resolve conflicts or overlapping decisions
    return this.resolveConflicts(decisions);
  }

  /**
   * Post-processes decisions to resolve conflicts, duplicates, or priority overrides.
   */
  private static resolveConflicts(decisions: Decision[]): Decision[] {
    // Standard rule: Only keep the highest priority decision if there are multiple decisions for the exact same category and target.
    // e.g. If we have two rules under 'training_load' and they conflict, we can define priority override logic here.
    // For now, our registered rules cover discrete aspects (e.g., ramp rate vs strain), so they are complementary.
    // But let's build a clean mechanism to deduplicate by Category + RuleId.
    const uniqueDecisions = new Map<string, Decision>();

    for (const decision of decisions) {
      const key = `${decision.category}_${decision.activityId || 'athlete'}_${decision.name}`;
      
      if (uniqueDecisions.has(key)) {
        const existing = uniqueDecisions.get(key)!;
        // Compare severity or rule priorities to override
        const existingRule = RuleRegistry.get(existing.supportingRules[0]);
        const currentRule = RuleRegistry.get(decision.supportingRules[0]);

        if (existingRule && currentRule && currentRule.definition.priority > existingRule.definition.priority) {
          uniqueDecisions.set(key, decision);
        }
      } else {
        uniqueDecisions.set(key, decision);
      }
    }

    return Array.from(uniqueDecisions.values());
  }
}
