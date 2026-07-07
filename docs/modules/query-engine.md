# Analytics Query Engine

The `AnalyticsQueryEngine` acts as the Application Layer of Track.Studio, serving as the bridge between core persistent storage / core metrics/decision engines and the presentation layers.

## Principles

1. **Read-Only**: This layer never creates, updates, or deletes records in the core repository.
2. **Zero Calculations**: This layer never performs mathematical calculations or formulas (e.g. CTL, ATL, RSS). It solely consumes already computed values from the Metric Engine.
3. **No Scientific Logic**: It never executes rules or determines athletic states. This is delegated entirely to the Rule Engine and Decision Engine.
4. **Cache-Friendly**: High-performance memoization policies guarantee fast responses and reduce Firestore collection scans.
5. **Traceability**: All generated View Models contain rich, versioned, traceable metadata connecting them to their source Canonical IDs, Metric IDs, and Decision IDs.

## API Reference

### `AnalyticsQueryEngine`

Constructor accepts an optional `QueryContext` for full in-memory dual mock/testing support:

```typescript
export interface QueryContext {
  athlete?: CanonicalAthlete;
  activities?: CanonicalActivity[];
  laps?: CanonicalLap[];
  splits?: CanonicalSplit[];
  streams?: Record<string, CanonicalStream>;
  gear?: CanonicalGear[];
  routes?: CanonicalRoute[];
  metrics?: ComputedMetric[];
  decisions?: Decision[];
  connections?: any[];
  syncAttempts?: any[];
}

const engine = new AnalyticsQueryEngine(context?);
```

### Methods

- **`queryHomeDashboard(athleteId)`**: Aggregates athlete profile, activities, metrics, decisions, connection, and sync logs to build the `HomeDashboardViewModel`.
- **`queryPerformanceOverview(athleteId)`**: Aggregates multi-workout CTL/ATL/TSB trends, season-bests, and adaptation scores to build the `PerformanceOverviewViewModel`.
- **`queryActivityDetail(userId, activityId)`**: Gathers splits, laps, streams, weather, and equipment metrics for detailed visualization.
- **`querySearchResult(athleteId, queryText, filters, sorting, pagination)`**: Executes the integrated Filter, Sort, and Pagination engines across athletic resources.
- **`queryCompare(athleteId, baseActivityId, targetActivityId)`**: Constructs a detailed differential analysis between two workouts.
