# Dashboard Templates Reference

This reference catalog documents the default composition structures, templates, and specifications for all 15 dashboards in the Track.Studio platform.

## Configuration Schema

Every template is initialized with:

- `layoutType`: Visual template design style.
- `gridDefinition`: Baseline columns and CSS gap styles.
- `widgetOrder`: Sequence of registered supported widgets.
- `widgetVisibility`: Default visible status maps.
- `widgetSize`: Default dimensions (`S` | `M` | `L` | `XL` | `Full Width`).
- `responsiveRules`: Point-to-point breakpoints scaling mappings.

---

## Catalog of Templates

### 1. Primary Dashboard (`home`)
- **Template ID**: `home`
- **Layout Type**: `bento`
- **Widgets**: `home_profile`, `home_weekly_summary`, `home_performance_metrics`
- **Default Sizes**:
  - `home_profile`: `S`
  - `home_weekly_summary`: `S`
  - `home_performance_metrics`: `L`

### 2. Performance Dashboard (`performance`)
- **Template ID**: `performance`
- **Layout Type**: `bento`
- **Widgets**: `perf_fitness_fatigue`, `perf_running_economy`, `perf_season_bests`
- **Default Sizes**:
  - `perf_fitness_fatigue`: `L`
  - `perf_running_economy`: `M`
  - `perf_season_bests`: `S`

### 3. Historical Feed (`activities_list`)
- **Template ID**: `activities_list`
- **Layout Type**: `single-column`
- **Widgets**: `act_list_view`, `act_stats_aggregation`

### 4. Advanced Analytics (`analytics`)
- **Template ID**: `analytics`
- **Layout Type**: `grid`
- **Widgets**: `pacing_variability`, `aerobic_decoupling`

### 5. Intensity Calculator (`intensity`)
- **Template ID**: `intensity`
- **Layout Type**: `grid`
- **Widgets**: `rss_calculator`, `intensity_factor_calc`

### 6. Training Stress Balance (`tsb`)
- **Template ID**: `tsb`
- **Layout Type**: `grid`
- **Widgets**: `tsb_simulator`, `ctl_atl_historical`

### 7. Performance Peak Curve (`peak_curve`)
- **Template ID**: `peak_curve`
- **Layout Type**: `grid`
- **Widgets**: `power_curve`, `peak_pace_intervals`

### 8. Running Economy Metrics (`economy`)
- **Template ID**: `economy`
- **Layout Type**: `grid`
- **Widgets**: `decoupling_estimator`, `efficiency_index_trends`

### 9. Equipment / Shoe Mileage Tracker (`equipment`)
- **Template ID**: `equipment`
- **Layout Type**: `grid`
- **Widgets**: `eq_shoe_mileage`, `eq_wear_predictor`

### 10. Physiologic Calibration Settings (`calibration`)
- **Template ID**: `calibration`
- **Layout Type**: `grid`
- **Widgets**: `set_thresholds`, `zone_calibrator`

### 11. Health Anomaly Logs (`health`)
- **Template ID**: `health`
- **Layout Type**: `grid`
- **Widgets**: `health_anomaly_logs`, `biometric_correlations`

### 12. Advanced Exporters (`exporters`)
- **Template ID**: `exporters`
- **Layout Type**: `grid`
- **Widgets**: `exp_fit_export`, `exp_intervals_sync`

### 13. System Handshake Settings (`settings`)
- **Template ID**: `settings`
- **Layout Type**: `single-column`
- **Widgets**: `sys_integration_tokens`, `sys_webhook_logs`

### 14. Activity Ingestion Center (`connections`)
- **Template ID**: `connections`
- **Layout Type**: `two-column`
- **Widgets**: `con_strava_credential`, `con_intervals_icu`

### 15. Contextual Query Finder (`search`)
- **Template ID**: `search`
- **Layout Type**: `single-column`
- **Widgets**: `search_engine_query`
