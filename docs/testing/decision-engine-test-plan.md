# Decision Engine Test Plan

This document outlines the test strategy and execution coverage for the Track.Studio Deterministic Rule and Decision Engine.

## Testing Objectives

1. **Verify Mathematical Determinism**: Ensure that identical input contexts (athlete, activity, metrics) always produce identical and reproducible decisions.
2. **Ensure Boundary Safety**: Validate that edge cases (null inputs, extremely high values, missing streams, and zero values) are handled gracefully without runtime exceptions.
3. **Audit Rule Registration**: Confirm that all required sports-science rules are properly loaded into the `RuleRegistry`.
4. **Validate Threshold Categorization**: Verify that raw metrics fall into the correct scientific zones defined within the `ThresholdRegistry`.
5. **Conflict and Priority Checks**: Guarantee that the `DecisionEngine` resolves duplicate or conflicting decisions using the correct priority order.
6. **Query and Trend Analysis**: Confirm that the `DecisionRepository` accurately saves, retrieves, and queries trends of decisions over time.

---

## Test Execution Matrix

The tests are fully automated and run in a dependency-free environment without requiring external testing databases or web server instances.

| Test Case Name | Target | Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| `runThresholdTests` | `ThresholdRegistry` | Evaluates TSB values (-35, -15, 0, 10) and boundary limits against defined bands. | Correct band labels and visual color codes are matched. |
| `runRuleRegistryTests` | `RuleRegistry` | Scans the registry to count active rules and check standard retrieval. | At least 12 standard rules are present. Rule fields are validated. |
| `runDecisionEngineTests` | `DecisionEngine` | Processes a standard context containing 9 computed metrics. | Generates active decision arrays. Validates correct statuses and codes. |
| `runDecisionRepositoryTests` | `DecisionRepository` | Tests upserting, querying (by athlete, category, severity), date filtering, and JSON import/export. | Persistence functions operate exactly as designed. Counts are maintained. |
| `runBoundaryAndRobustnessTests` | `DecisionEngine` | Simulates completely empty metrics array and fully blank/null activities. | Processes successfully without raising NullReferenceExceptions. |

---

## Running the Tests

To execute the test suite in the development or CI/CD environment, run the following shell command from the project workspace root:

```bash
npx tsx ./lib/decision-engine/tests/run-tests.ts
```

All logs will output directly to stdout in a clean, human-readable format.
If any assertion fails, the process exits with status code `1`, causing build/test pipelines to halt automatically.
