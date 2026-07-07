# Threshold Registry Reference

The Threshold Registry holds scientific bounding bands, naming standards, and visual indicator color hexes for the Track.Studio platform. This library decouples logical evaluation from raw numeric values.

All default configurations are listed below.

---

### 1. Training Stress Balance (TSB) Form Zones
- **ID**: `tsb_form_zones`
- **Category**: `recovery`
- **Version**: `1.0.0`
- **Bands**:
  - `Highly Fatigued`: [-100, -30] (Color: `#ef4444`)
  - `Fatigued`: [-30, -10] (Color: `#f97316`)
  - `Optimal Training`: [-10, 5] (Color: `#10b981`)
  - `Peaking / Fresh`: [5, 25] (Color: `#3b82f6`)
  - `Transition / Deconditioning`: [25, 100] (Color: `#6b7280`)

### 2. 7-Day Training Monotony
- **ID**: `training_monotony_risk`
- **Category**: `consistency`
- **Version**: `1.0.0`
- **Bands**:
  - `Very Low Variation`: [2.0, 10.0] (Color: `#ef4444`)
  - `Elevated Monotony`: [1.5, 2.0] (Color: `#f97316`)
  - `Optimal Variation`: [1.0, 1.5] (Color: `#10b981`)
  - `High Variation`: [0.0, 1.0] (Color: `#3b82f6`)

### 3. 7-Day Training Strain
- **ID**: `training_strain_risk`
- **Category**: `recovery`
- **Version**: `1.0.0`
- **Bands**:
  - `Critical Risk`: [3000, 100000] (Color: `#ef4444`)
  - `High Risk`: [2000, 3000] (Color: `#f97316`)
  - `Optimal Stimulus`: [500, 2000] (Color: `#10b981`)
  - `Low Stimulus`: [0, 500] (Color: `#6b7280`)

### 4. Training Ramp Rate (Weekly CTL Gain)
- **ID**: `weekly_ramp_rate`
- **Category**: `training_load`
- **Version**: `1.0.0`
- **Bands**:
  - `Excessive Gain (Danger)`: [8.0, 100.0] (Color: `#ef4444`)
  - `Elevated Gain (Caution)`: [5.0, 8.0] (Color: `#f97316`)
  - `Optimal Progression`: [1.5, 5.0] (Color: `#10b981`)
  - `Maintenance / Decline`: [-100.0, 1.5] (Color: `#6b7280`)

### 5. Aerobic Decoupling (Pa:Hr)
- **ID**: `aerobic_decoupling_efficiency`
- **Category**: `heart_rate`
- **Version**: `1.0.0`
- **Bands**:
  - `High Decoupling (Deconditioned)`: [10.0, 100.0] (Color: `#ef4444`)
  - `Moderate Decoupling`: [5.0, 10.0] (Color: `#f97316`)
  - `Excellent Aerobic Fitness`: [-10.0, 5.0] (Color: `#10b981`)

### 6. Cardiovascular Drift
- **ID**: `cardiac_drift_zones`
- **Category**: `heart_rate`
- **Version**: `1.0.0`
- **Bands**:
  - `Critical Drift (Heat/Dehydration)`: [15.0, 100.0] (Color: `#ef4444`)
  - `Elevated Drift`: [8.0, 15.0] (Color: `#f97316`)
  - `Normal Drift`: [-5.0, 8.0] (Color: `#10b981`)

### 7. Pace Stability / Pace Coefficient of Variation
- **ID**: `pace_stability_index`
- **Category**: `pacing`
- **Version**: `1.0.0`
- **Bands**:
  - `Highly Consistent`: [0.95, 1.0] (Color: `#10b981`)
  - `Consistent`: [0.85, 0.95] (Color: `#3b82f6`)
  - `Moderately Variable`: [0.70, 0.85] (Color: `#f97316`)
  - `Highly Variable (Intervals/Hills)`: [0.0, 0.70] (Color: `#6b7280`)

### 8. Cadence Stability
- **ID**: `cadence_stability`
- **Category**: `cadence`
- **Version**: `1.0.0`
- **Bands**:
  - `Excellent`: [175.0, 210.0] (Color: `#10b981`)
  - `Stable`: [165.0, 175.0] (Color: `#3b82f6`)
  - `Variable`: [150.0, 165.0] (Color: `#f97316`)
  - `Unstable`: [0.0, 150.0] (Color: `#ef4444`)

### 9. Running Power Variability Index (VI)
- **ID**: `power_variability_index`
- **Category**: `power`
- **Version**: `1.0.0`
- **Bands**:
  - `Stable`: [1.0, 1.05] (Color: `#10b981`)
  - `Efficient`: [1.05, 1.10] (Color: `#3b82f6`)
  - `Variable`: [1.10, 1.20] (Color: `#f97316`)
  - `Highly Variable`: [1.20, 2.0] (Color: `#ef4444`)

### 10. Data Integrity Score
- **ID**: `data_integrity_quality`
- **Category**: `data_quality`
- **Version**: `1.0.0`
- **Bands**:
  - `Excellent`: [90.0, 100.0] (Color: `#10b981`)
  - `Good`: [75.0, 90.0] (Color: `#3b82f6`)
  - `Acceptable`: [50.0, 75.0] (Color: `#f97316`)
  - `Poor`: [25.0, 50.0] (Color: `#6b7280`)
  - `Insufficient`: [0.0, 25.0] (Color: `#ef4444`)

### 11. Apparent Temperature (Steadman Heat Stress)
- **ID**: `apparent_temperature_stress`
- **Category**: `environment`
- **Version**: `1.0.0`
- **Bands**:
  - `Extreme Heat`: [40.0, 100.0] (Color: `#ef4444`)
  - `Hot`: [30.0, 40.0] (Color: `#f97316`)
  - `Warm`: [20.0, 30.0] (Color: `#eab308`)
  - `Comfortable`: [5.0, 20.0] (Color: `#10b981`)
  - `Cold Stress`: [-50.0, 5.0] (Color: `#3b82f6`)

### 12. Altitude Exposure levels
- **ID**: `altitude_exposure_level`
- **Category**: `elevation`
- **Version**: `1.0.0`
- **Bands**:
  - `Extreme Exposure`: [3000.0, 9000.0] (Color: `#ef4444`)
  - `High Exposure`: [2000.0, 3000.0] (Color: `#f97316`)
  - `Moderate Exposure`: [1000.0, 2000.0] (Color: `#3b82f6`)
  - `Sea Level / Low Altitude`: [-100.0, 1000.0] (Color: `#10b981`)
