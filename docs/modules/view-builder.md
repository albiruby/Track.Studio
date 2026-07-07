# View Builder

View Builders in Track.Studio translate raw domain structures and computed metrics into presentation-ready View Models.

## Architectural Boundaries

- **Separation of Concerns**: Builders only compose data structure shapes. They are strictly separate from raw Query execution logic.
- **Zero-Mutation**: Builders never mutate input objects. They return fresh, immutable View Model instances.
- **Null Safety**: Safe accessors with default values prevent page crashes on incomplete sensor profiles (e.g. missing cadence, power, or heart rate).

## Reference Implementation

```typescript
export class HomeDashboardViewBuilder {
  public static build(
    athlete: CanonicalAthlete,
    activities: CanonicalActivity[],
    metrics: ComputedMetric[],
    decisions: Decision[],
    connections: any[] = [],
    syncAttempts: any[] = []
  ): HomeDashboardViewModel;
}
```

Every builder attaches standard traceability indicators using `createTraceability(...)` to track versions and source dependencies.
