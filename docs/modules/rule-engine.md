# Rule Engine

The Rule Engine is a highly modular, deterministic layer designed to evaluate athlete and activity metrics against industry-standard scientific formulas. It is completely decoupled from any presentation layer, databases, or third-party client integrations.

## Architecture

```
Computed Metrics
       ↓
   [Context] → (Athlete, Activity, History)
       ↓
 [Rule Registry] → Matches active rule definitions
       ↓
  [Evaluation] → Runs individual rule logic
       ↓
Generated Decisions
```

## Features

- **No AI / No ML**: The system is 100% deterministic, meaning the exact same input metrics will always yield the exact same decision objects.
- **Rule Registries**: A centralized system for defining, indexing, and executing sports-science rules.
- **Priority Execution**: Rules run based on a `priority` level, allowing downstream composite rules to inspect decisions made by upstream rules.
- **Traceability**: Every decision generated contains rule and threshold versions, scientific references, confidence ratings, and explanation codes.

## Rule Structure

Each registered rule implements the `RuleRegistryEntry` interface:

```typescript
export interface RuleDefinition {
  ruleId: string;
  name: string;
  category: DecisionCategory;
  scientificPurpose: string;
  inputMetrics: string[];
  priority: number;
  dependencies: string[];
  version: string;
  reference: string;
  status: 'active' | 'deprecated' | 'experimental';
}

export interface RuleRegistryEntry {
  definition: RuleDefinition;
  evaluate: (context: DecisionEvaluationContext) => Decision | null;
}
```

## Supported Decision Categories

1. **Training Load**: Evaluates chronic and acute progression safety.
2. **Fatigue**: Checks short-term fatigue levels (ATL, TSB).
3. **Recovery**: Identifies physical readiness for training adaptation or race tapering.
4. **Fitness**: Evaluates aerobic fitness level adaptations.
5. **Running Efficiency**: Monitors cardio-mechanical efficiency factors.
6. **Heart Rate**: Inspects cardiac drift and aerobic decoupling.
7. **Pacing**: Determines split type pacing consistency.
8. **Power**: Assesses power distribution and mechanical pacing stability.
9. **Cadence**: Identifies step rate stability and fatigue-induced decay.
10. **Elevation**: Checks altitude exposure safety thresholds.
11. **Performance**: Analyzes performance trend progressions and training plateaus.
12. **Data Quality**: Evaluates recording density, sensor coverage, and reliability.
13. **Environment**: Identifies heat and cold stress indices.
14. **Equipment**: Traces shoe use cycles and midsole decay.
15. **Synchronization Health**: Validates payload schemas and data structure safety.

## Version Policy

- **Major updates** (e.g., changes in core athletic metrics or parameters) increment the Major Version (e.g., `1.0.0` to `2.0.0`).
- **Minor additions** (e.g., adding supplementary metrics to an existing rule evaluation) increment the Minor Version (e.g., `1.0.0` to `1.1.0`).
- **Bugs/Fixes** increment the Patch Version (e.g., `1.0.0` to `1.0.1`).
