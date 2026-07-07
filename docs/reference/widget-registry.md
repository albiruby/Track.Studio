# Widget Registry Catalog

Track.Studio registers 37 distinct widgets corresponding to the 15 performance, telemetry, and system administration dashboards. This catalog defines their metadata bounds.

---

## 1. Widget Categories

Widgets are partitioned into five core structural domains:
1. **Core Workspace**: Athlete bio profile context, training feed ingestion directories, and summaries.
2. **Analytics Engine**: Macro volume calculations, ramp rates, and dual comparative deltas.
3. **Sensor Insights**: Micro cardiac drift decoupling, power duration curves, and cadence stability indexes.
4. **Environment & Gear**: Extreme climate acclimation, elevation adjustments, and biomechanical gear wear indices.
5. **System Administration**: Webhook synchronizations, database integrity tests, and physiological thresholds settings.

---

## 2. Structural Schema Directory

Below is the complete registry index of all 37 widgets:

| Widget ID | Title | Owner Dashboard | Required ViewModel | Supported Sizes |
| :--- | :--- | :--- | :--- | :--- |
| `home_profile` | Athlete Profile Context | `dashboard` | `HomeDashboardViewModel` | S, M, L |
| `home_recent_activity` | Recent Ingested Activity | `dashboard` | `HomeDashboardViewModel` | M, L, XL |
| `home_weekly_summary` | Weekly Training Volume | `dashboard` | `HomeDashboardViewModel` | S, M |
| `home_performance_metrics` | Performance Load Matrix | `dashboard` | `HomeDashboardViewModel` | M, L, XL, Full |
| `perf_fitness_fatigue` | Fitness & Fatigue Trends | `performance` | `PerformanceOverviewViewModel` | L, XL, Full |
| `perf_form_balance` | Form & Recovery Balance | `performance` | `PerformanceOverviewViewModel` | M, L |
| `perf_season_bests` | Personal and Season Bests | `performance` | `PerformanceOverviewViewModel` | S, M, L |
| `perf_running_economy` | VO2max Running Economy | `performance` | `PerformanceOverviewViewModel` | S, M |
| `act_list_view` | Activity Index Directory | `activities` | `ActivitySummaryViewModel` | L, XL, Full |
| `act_stats_aggregation` | Monthly Aggregate Achievements | `activities` | `ActivitySummaryViewModel` | S, M |
| `act_quality_scores` | Signal Integrity & Noise | `activities` | `ActivityDetailViewModel` | S, M, L |
| `hr_distribution` | Heart Rate Zone Distribution | `heart_rate` | `HeartRateOverviewViewModel` | M, L, XL |
| `hr_drift_coupling` | Cardiac Drift & Decoupling | `heart_rate` | `HeartRateOverviewViewModel` | S, M, L |
| `hr_efficiency` | Heart Rate Efficiency | `heart_rate` | `HeartRateOverviewViewModel` | S, M |
| `power_curve` | Power Duration Curve | `power` | `PowerOverviewViewModel` | L, XL, Full |
| `power_zones` | Power Intensity Distribution | `power` | `PowerOverviewViewModel` | M, L |
| `power_efficiency` | Mechanical Efficiency Index | `power` | `PowerOverviewViewModel` | S, M |
| `cadence_stability` | Stride Cadence Stability Rate | `cadence` | `CadenceOverviewViewModel` | M, L |
| `cadence_decay` | Fatigue-Induced Cadence Decay | `cadence` | `CadenceOverviewViewModel` | S, M |
| `load_ctl_trend` | CTL Trajectory | `training_load` | `TrainingLoadOverviewViewModel` | L, XL, Full |
| `load_ramp_rate` | Ramp Rate Risk Indicator | `training_load` | `TrainingLoadOverviewViewModel` | M, L |
| `rec_readiness` | Physiological Readiness Score | `recovery` | `RecoveryOverviewViewModel` | M, L |
| `rec_monotony` | Overtraining Monotony Rating | `recovery` | `RecoveryOverviewViewModel` | S, M |
| `env_heat_acclimation` | Heat & Humidity Acclimatization | `environment` | `EnvironmentOverviewViewModel` | S, M |
| `env_impact_pace` | Climatic Pacing Impact | `environment` | `EnvironmentOverviewViewModel` | M, L |
| `eq_shoe_mileage` | Gear Cumulative Mileage | `equipment` | `EquipmentOverviewViewModel` | L, XL, Full |
| `eq_injury_assessment` | Injury Risk Assessment | `equipment` | `EquipmentOverviewViewModel` | M, L |
| `conn_strava` | Strava API Credentials Gate | `connections` | `SyncHealthViewModel` | M, L |
| `conn_intervals` | Intervals.icu Integration | `connections` | `SyncHealthViewModel` | M, L |
| `health_integrity` | Sensor Data Signal Integrity | `data_health` | `DataHealthViewModel` | M, L |
| `health_anomaly_logs` | Telemetry Drops & Outliers | `data_health` | `DataHealthViewModel` | L, XL, Full |
| `set_thresholds` | Physiological Zone Calibrations | `settings` | `SettingsViewModel` | L, XL, Full |
| `set_sync_prefs` | Automatic Sync Webhook Rules | `settings` | `SettingsViewModel` | S, M |
| `search_query_input` | Advanced Query Console | `search` | `SearchResultViewModel` | L, XL, Full |
| `search_results_grid` | Filtered Results Matrix | `search` | `SearchResultViewModel` | L, XL, Full |
| `comp_activity_selector` | Dual Ingested Run Picker | `compare` | `CompareViewModel` | L, XL, Full |
| `comp_delta_matrix` | Comparative Delta Matrix | `compare` | `CompareViewModel` | L, XL, Full |
