# Decision Engine

The Decision Engine acts as the coordinator for the Track.Studio rule system. It is responsible for building evaluation contexts, running active rules in priority order, resolving conflicts, and formatting structured decision outputs.

## Decision Flow

1. **Context Construction**: Receives the athlete, activity, history, and calculated metric arrays.
2. **Rule Fetching**: Pulls active rules from the centralized `RuleRegistry`.
3. **Priority Sorting**: Sorts rules ascending by priority so simpler metrics run first, creating a foundation of downstream decisions.
4. **Evaluation**: Iterates through sorted rules, passing the accumulating list of generated decisions into each subsequent evaluation.
5. **Conflict Resolution**: Executes post-processing logic to deduplicate, override, or clear competing decisions based on severity and status.
6. **Output Formatting**: Standardizes the output into trace-ready `Decision` objects.

```
+-------------------------------------------------------+
|                 DECISION EVALUATION                   |
+-------------------------------------------------------+
|  1. Construct context (Athlete, Activity, Metrics)    |
|  2. Sort rules by Priority (Ascending)                |
|  3. Run Rules & accumulate decisions                  |
|  4. Resolve Conflicts (Deduplicate / Override)       |
|  5. Return trace-ready Decision array                 |
+-------------------------------------------------------+
```

## Structured Decision Object Schema

The Decision Engine avoids natural language generation or unstructured text to prevent ambiguity. Every decision is formatted as a structured object:

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `decisionId` | `string` | Unique deterministic identifier. |
| `athleteId` | `string` | ID of the athlete. |
| `activityId` | `string` | Optional ID of the associated activity. |
| `category` | `string` | Evaluated category domain. |
| `name` | `string` | Human-readable title of the rule. |
| `status` | `string` | Scientific evaluation label (e.g. "Optimal", "Highly Fatigued"). |
| `severity` | `string` | Escalation status (`info` \| `low` \| `medium` \| `high` \| `critical`). |
| `score` | `number` | Normalized score between 0 and 100. |
| `supportingMetrics` | `Record` | Traceable mapping of metric inputs and evaluated values. |
| `supportingRules` | `string[]` | Triggering Rule ID references. |
| `thresholdVersion` | `string` | Version of the threshold definition evaluated against. |
| `ruleVersion` | `string` | Version of the rule evaluated. |
| `scientificReferences` | `string[]` | Literature or clinical source citations. |
| `generatedTimestamp` | `string` | Evaluation date-time in ISO 8601. |
| `confidence` | `number` | Quality coefficient from 0.0 to 1.0 (based on sensor coverage). |
| `explanationCode` | `string` | Unique error/outcome code (e.g., `TL_RAMP_DANGER`). |

## Conflict Resolution & Deduplication

In cases where multiple rules evaluate similar domains or competing criteria, the Decision Engine executes strict, deterministic override rules:
- Duplicate rules for the exact same category, activity, and name are merged.
- If they conflict, the rule with the higher priority in the `RuleRegistry` overrides the lower-priority decision.
- Critical-severity decisions override lower-severity flags in duplicate evaluation loops.
