# Visualization Registry Reference

This reference catalog details the baseline analytical templates registered in the Visualization Registry.

---

## Registered Visualizations

### 1. Performance Trends (`perf-trend`)
- **Type**: `area`
- **ViewModel**: `PerformanceHistoryViewModel`
- **Required Fields**: `date`, `ctl`, `atl`, `tsb`
- **Theme**: Slate

### 2. Pacing Variability (`pacing-variability`)
- **Type**: `scatter`
- **ViewModel**: `ActivityPacingViewModel`
- **Required Fields**: `distance`, `pace`, `hr`
- **Theme**: High-Contrast

### 3. Power Curve (`power-curve`)
- **Type**: `line`
- **ViewModel**: `MeanMaximalPowerViewModel`
- **Required Fields**: `duration`, `watts`, `wattsKg`
- **Theme**: Slate

### 4. Aerobic Decoupling (`decoupling`)
- **Type**: `line`
- **ViewModel**: `AerobicDecouplingViewModel`
- **Required Fields**: `time`, `efficiencyFactor`, `decouplingPercent`
- **Theme**: High-Contrast

### 5. Zone Distribution (`zone-distribution`)
- **Type**: `zone-distribution`
- **ViewModel**: `ZoneDistributionViewModel`
- **Required Fields**: `zone`, `timeInZone`, `percentTime`
- **Theme**: Slate
