# Rule Registry Reference

This reference catalog details all registered deterministic rules running inside the Track.Studio Decision Engine.

---

### 1. CTL Weekly Ramp Rate Rule
- **Rule ID**: `rule_training_load_ramp`
- **Category**: `training_load`
- **Scientific Purpose**: Assess the safety of chronic training load accumulation to prevent musculoskeletal strain.
- **Dependencies**: None
- **Priority**: 10
- **Input Metrics**: `ctl`
- **Expected Statuses**: `Excessive Gain (Danger)`, `Elevated Gain (Caution)`, `Optimal Progression`, `Maintenance / Decline`
- **Source Reference**: Friel (2015) The Power Meter Handbook / Bannister CTL Limits

### 2. TSB Form and Fatigue Rule
- **Rule ID**: `rule_recovery_tsb`
- **Category**: `recovery`
- **Scientific Purpose**: Identify physical fatigue states and peaking suitability using Training Stress Balance.
- **Dependencies**: None
- **Priority**: 20
- **Input Metrics**: `tsb`, `ctl`, `atl`
- **Expected Statuses**: `Highly Fatigued`, `Fatigued`, `Recovering`, `Recovered`, `Insufficient Recovery`
- **Source Reference**: Coggan (2006) Training and Racing with a Power Meter

### 3. Aerobic Decoupling Rule
- **Rule ID**: `rule_heart_rate_decoupling`
- **Category**: `heart_rate`
- **Scientific Purpose**: Assess aerobic endurance stability and cardiac fitness by analyzing speed-to-HR decoupling.
- **Dependencies**: None
- **Priority**: 30
- **Input Metrics**: `hr_decoupling`, `avg_hr`
- **Expected Statuses**: `Excellent`, `Moderate`, `Critical`
- **Source Reference**: Joe Friel (The Triathlete's Training Bible)

### 4. Cardiac Drift Evaluation
- **Rule ID**: `rule_heart_rate_drift`
- **Category**: `heart_rate`
- **Scientific Purpose**: Identify cardiovascular drift as a proxy for thermal strain, hydration status, or deconditioning.
- **Dependencies**: None
- **Priority**: 31
- **Input Metrics**: `hr_drift`
- **Expected Statuses**: `Excellent`, `Elevated`, `Critical`
- **Source Reference**: Coyle & Gonzalez-Alonso (Cardiac Drift, 2001)

### 5. Pace Stability Evaluation
- **Rule ID**: `rule_pacing_stability`
- **Category**: `pacing`
- **Scientific Purpose**: Evaluate pacing distribution stability during flat steady-state workouts to index running form.
- **Dependencies**: None
- **Priority**: 15
- **Input Metrics**: `pace_stability`, `split_type`
- **Expected Statuses**: `Highly Consistent`, `Consistent`, `Moderately Variable`, `Variable`
- **Source Reference**: Sport Biomechanics Standard Pacing Guidelines

### 6. Running Power Variability Rule
- **Rule ID**: `rule_power_variability`
- **Category**: `power`
- **Scientific Purpose**: Examine mechanical pacing efficiency by looking at Normalized Power Variability Index (VI).
- **Dependencies**: None
- **Priority**: 16
- **Input Metrics**: `rss`, `tss`
- **Expected Statuses**: `Stable`, `Efficient`, `Variable`, `Highly Variable`
- **Source Reference**: Coggan (2010) Training and Racing with a Power Meter

### 7. Running Cadence Stability Rule
- **Rule ID**: `rule_cadence_efficiency`
- **Category**: `cadence`
- **Scientific Purpose**: Identify biomechanical stride frequency efficiency and fatigue-related step rate drops.
- **Dependencies**: None
- **Priority**: 12
- **Input Metrics**: None (evaluates activity.averageCadenceRpm)
- **Expected Statuses**: `Excellent`, `Stable`, `Variable`, `Unstable`
- **Source Reference**: Daniel's Running Formula (180 SPM benchmark)

### 8. Athlete Performance Trend Rule
- **Rule ID**: `rule_performance_trend`
- **Category**: `performance`
- **Scientific Purpose**: Track long-term performance improvement or training plateau over history.
- **Dependencies**: None
- **Priority**: 50
- **Input Metrics**: None (evaluates historical speed adaptions)
- **Expected Statuses**: `Improving`, `Stable`, `Plateau`, `Declining`
- **Source Reference**: Banister Impulse Response Fitness-Fatigue model

### 9. Data Integrity Quality Rule
- **Rule ID**: `rule_data_quality_integrity`
- **Category**: `data_quality`
- **Scientific Purpose**: Audit input sensor streams to determine reliability of computed sports science metrics.
- **Dependencies**: None
- **Priority**: 5
- **Input Metrics**: `integrity_score`
- **Expected Statuses**: `Excellent`, `Good`, `Acceptable`, `Poor`, `Insufficient`
- **Source Reference**: Data Engineering Standards for Wearable Devices

### 10. Environmental Apparent Temp Rule
- **Rule ID**: `rule_environment_temp`
- **Category**: `environment`
- **Scientific Purpose**: Identify ambient temperature heat/cold stress affecting metabolic load.
- **Dependencies**: None
- **Priority**: 8
- **Input Metrics**: None (evaluates weather temp)
- **Expected Statuses**: `Extreme Heat`, `Hot`, `Warm`, `Comfortable`, `Cold Stress`
- **Source Reference**: Steadman (1979) Assessment of Heat Stress

### 11. Running Effectiveness & Cardio-Mechanical Efficiency Rule
- **Rule ID**: `rule_running_efficiency`
- **Category**: `running_efficiency`
- **Scientific Purpose**: Evaluate metabolic-to-speed efficiency of the running stride.
- **Dependencies**: None
- **Priority**: 14
- **Input Metrics**: `running_effectiveness`, `efficiency_factor`
- **Expected Statuses**: `Highly Efficient`, `Efficient`, `Variable`
- **Source Reference**: Dr. Andrew Coggan running effectiveness index

### 12. Altitude Exposure Rule
- **Rule ID**: `rule_elevation_altitude`
- **Category**: `elevation`
- **Scientific Purpose**: Evaluate oxygen density impairment due to extreme altitude training heights.
- **Dependencies**: None
- **Priority**: 7
- **Input Metrics**: None (evaluates elevation maxAlt)
- **Expected Statuses**: `Extreme Exposure`, `High Exposure`, `Moderate Exposure`, `Sea Level / Low Altitude`
- **Source Reference**: Sports Science High Altitude Adaptive Guidelines

### 13. Weekly Load Variation Rule
- **Rule ID**: `rule_consistency_weekly`
- **Category**: `consistency`
- **Scientific Purpose**: Monitor weekly load spikes or drops to prevent injury and preserve fitness.
- **Dependencies**: None
- **Priority**: 18
- **Input Metrics**: `monotony_7day`
- **Expected Statuses**: `Unstable`, `Variable`, `Excellent`, `Stable`
- **Source Reference**: Foster, C. (1998) Monitoring Training in Athletes

### 14. Equipment Mileage Check Rule
- **Rule ID**: `rule_equipment_mileage`
- **Category**: `equipment`
- **Scientific Purpose**: Trace shoe fatigue to mitigate impact injury from expired midsole compression.
- **Dependencies**: None
- **Priority**: 11
- **Input Metrics**: None (evaluates simulated/actual shoe mileage)
- **Expected Statuses**: `Excellent`, `Elevated`, `Stable`, `Critical`
- **Source Reference**: American Academy of Podiatric Sports Medicine

### 15. Data Synchronization Integrity Rule
- **Rule ID**: `rule_sync_health_status`
- **Category**: `sync_health`
- **Scientific Purpose**: Validate payload schemas and synchronizer jobs to prevent database record corruptions.
- **Dependencies**: None
- **Priority**: 4
- **Input Metrics**: None (evaluates schema metadata)
- **Expected Statuses**: `Excellent`, `Insufficient`
- **Source Reference**: System Schema Consistency & Integrity Principles
