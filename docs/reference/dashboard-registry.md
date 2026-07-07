# Dashboard Registry Reference

This reference index catalogues all 15 performance dashboards configured within `DASHBOARD_REGISTRY` in `/lib/dashboard/registry.ts`.

---

| ID | Name | Category | Layout Template | Supported View Models | Supported Widgets |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`dashboard`** | Home Dashboard | Core Workspace | `bento` | `HomeDashboardViewModel` | `home_profile`, `home_recent_activity`, `home_weekly_summary`, `home_performance_metrics` |
| **`performance`** | Performance Dashboard | Analytics Engine | `grid` | `PerformanceOverviewViewModel` | `perf_fitness_fatigue`, `perf_form_balance`, `perf_season_bests`, `perf_running_economy` |
| **`activities`** | Activities Dashboard | Core Workspace | `split` | `ActivitySummaryViewModel`, `ActivityDetailViewModel` | `act_list_view`, `act_stats_aggregation`, `act_quality_scores` |
| **`heart_rate`** | Heart Rate Dashboard | Sensor Insights | `grid` | `HeartRateOverviewViewModel` | `hr_distribution`, `hr_drift_coupling`, `hr_efficiency` |
| **`power`** | Power Dashboard | Sensor Insights | `grid` | `PowerOverviewViewModel` | `power_curve`, `power_zones`, `power_efficiency` |
| **`cadence`** | Cadence Dashboard | Sensor Insights | `grid` | `CadenceOverviewViewModel` | `cadence_stability`, `cadence_decay` |
| **`training_load`** | Training Load Dashboard | Analytics Engine | `bento` | `TrainingLoadOverviewViewModel` | `load_ctl_trend`, `load_ramp_rate` |
| **`recovery`** | Recovery Dashboard | Analytics Engine | `grid` | `RecoveryOverviewViewModel` | `rec_readiness`, `rec_monotony` |
| **`environment`** | Environment Dashboard | Environment & Gear | `grid` | `EnvironmentOverviewViewModel` | `env_heat_acclimation`, `env_impact_pace` |
| **`equipment`** | Equipment Dashboard | Environment & Gear | `grid` | `EquipmentOverviewViewModel` | `eq_shoe_mileage`, `eq_injury_assessment` |
| **`connections`** | Connections Dashboard | System Administration | `connections` | `SyncHealthViewModel` | `conn_strava`, `conn_intervals` |
| **`data_health`** | Data Health Dashboard | System Administration | `grid` | `DataHealthViewModel` | `health_integrity`, `health_anomaly_logs` |
| **`settings`** | Settings Dashboard | System Administration | `vertical` | `SettingsViewModel` | `set_thresholds`, `set_sync_prefs` |
| **`search`** | Search Dashboard | Analytics Engine | `vertical` | `SearchResultViewModel` | `search_query_input`, `search_results_grid` |
| **`compare`** | Compare Dashboard | Analytics Engine | `split` | `CompareViewModel` | `comp_activity_selector`, `comp_delta_matrix` |

---

## Technical Invariant Enforcement
To maintain strict architectural separation:
1. **Never make inline calculations** inside the presentations of these widgets.
2. **Never execute direct Firestore queries** in any dashboard container.
3. Every card is an elegant, pure UI terminal executing unidirectional rendering of pre-resolved values from the View Model fields.
