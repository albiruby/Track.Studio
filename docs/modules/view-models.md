# View Models

View Models represent strongly-typed, frontend-agnostic, and completely presentation-ready models. Track.Studio defines 20 explicit view models matching core dashboard, performance, training, and system administration pages.

## Standard Metadata & Traceability

Every single View Model includes a `traceability` block conforming to:

```typescript
export interface ViewModelTraceability {
  canonicalIds: string[];
  metricIds: string[];
  decisionIds: string[];
  syncIds: string[];
  repositoryVersions: {
    canonical: string;
    metrics: string;
    decisions: string;
    connections?: string;
  };
  viewVersion: string;
  timestamp: string; // ISO DateTime
}
```

## Supported View Models

1. **`HomeDashboardViewModel`**: Complete overview of active athlete status, recent activities, load metrics, live alerts, and connection health.
2. **`PerformanceOverviewViewModel`**: Fitness (CTL), Fatigue (ATL), and Form (TSB) histories, running economy trends, and seasonal bests.
3. **`ActivitySummaryViewModel`**: High-level activity card fields.
4. **`ActivityDetailViewModel`**: Full deep dive including laps, splits, sensor coverages, weather details, and gear information.
5. **`WeeklyTrainingViewModel`**: Multi-day distribution of distance, moving duration, and cumulative training stress (RSS).
6. **`MonthlyTrainingViewModel`**: Calendar month aggregated training totals and weekly breakdown summaries.
7. **`HeartRateOverviewViewModel`**: Resting/max zones, aerobic threshold estimates, cardiovascular drift, and efficiency metrics.
8. **`PowerOverviewViewModel`**: Critical power curves, mechanical efficiency, power zones, and FTP historical targets.
9. **`CadenceOverviewViewModel`**: Cadence stability histories, cadence versus duration decay rates, and gait profiles.
10. **`TrainingLoadOverviewViewModel`**: Rolling load curves, chronic fatigue profiles, and progressive loading limits.
11. **`RecoveryOverviewViewModel`**: Acute readiness scores, monotony indexes, and workout selection advice.
12. **`EnvironmentOverviewViewModel`**: Extreme weather logs, comfortable temperature profiles, and heat acclimatization progress.
13. **`EquipmentOverviewViewModel`**: Gear mileage tracking, footwear life cycle metrics, and injury hazard thresholds.
14. **`SyncHealthViewModel`**: Sync success rates, rate limits, sync logs, and active connection health metrics.
15. **`DataHealthViewModel`**: Multi-sensor coverage rates, outlier detections, and signal drop-out indicators.
16. **`SearchResultViewModel`**: Text queries with filtered, sorted, and paginated outputs.
17. **`CompareViewModel`**: Head-to-head metrics difference and pacing offsets between two activities.
18. **`TimelineViewModel`**: chronological timeline stream of training sessions, records, gear upgrades, and sync attempts.
19. **`AthleteProfileViewModel`**: Core profile data, biometric summaries, and credential status.
20. **`SettingsViewModel`**: Custom threshold settings, zone definitions, and user preferences.
