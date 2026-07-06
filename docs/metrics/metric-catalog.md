# Metric Catalog

This is the canonical catalog of all 30+ registered metrics supported by the Track.Studio Sports Science Metric Engine.

---

| Metric ID | Metric Name | Category | Units | Physiological / Mechanical Description |
| :--- | :--- | :--- | :--- | :--- |
| `moving_pace` | Moving Pace | `activity` | `min/km` | Net average minutes per kilometer (moving only). |
| `elapsed_pace` | Elapsed Pace | `activity` | `min/km` | Gross average minutes per kilometer (including stops). |
| `average_speed` | Average Speed | `activity` | `m/s` | Gross speed (total distance over total elapsed time). |
| `moving_speed` | Moving Speed | `activity` | `m/s` | Net speed (total distance over moving duration). |
| `distance` | Distance | `activity` | `m` | Cumulative horizontal meters traveled. |
| `duration` | Duration | `activity` | `s` | Net active training time in seconds. |
| `calories` | Calories | `activity` | `kcal` | Estimated gross metabolic energy expended. |
| `work` | Mechanical Work | `activity` | `kJ` | Cumulative physical work done (Power $\times$ Duration). |
| `avg_pace` | Average Pace | `pacing` | `min/km` | Canonical decimal moving pace. |
| `best_pace` | Best Pace | `pacing` | `min/km` | Net peak speed represented as decimal minutes per kilometer. |
| `worst_pace` | Worst Pace | `pacing` | `min/km` | Net slowest pace recorded while in active motion. |
| `split_type` | Pacing Split Type | `pacing` | `category` | Classification: `negative`, `positive`, or `even`. |
| `pace_variability`| Pace Variability | `pacing` | `ratio` | Coefficient of variation (CV) of running pace. |
| `pace_stability` | Pace Stability | `pacing` | `index` | Consistency index (inverse of variability) from 0 to 1. |
| `critical_pace` | Critical Pace | `pacing` | `min/km` | Sustainable threshold pace (45-60 min limit). |
| `avg_hr` | Average Heart Rate | `heart-rate` | `bpm` | Gross average heart rate during workout. |
| `max_hr` | Maximum Heart Rate | `heart-rate` | `bpm` | Peak heart rate recorded during workout. |
| `hr_drift` | Heart Rate Drift | `heart-rate` | `%` | Cardiovascular drift between first and second halves. |
| `hrv_proxy` | HRV Proxy (SNDR) | `heart-rate` | `ms` | Heart rate stability proxy (SD of HR stream). |
| `hr_decoupling` | Aerobic Decoupling | `heart-rate` | `%` | Change in Speed:HR efficiency ratio over two halves. |
| `running_effectiveness` | Running Effectiveness| `efficiency`| `ratio` | Ratio of forward speed to metabolic power (W/kg). |
| `efficiency_factor` | Efficiency Factor (EF)| `efficiency`| `ratio` | Ratio of work (Normalized Power or Speed) to HR cost. |
| `stride_length` | Stride Length | `efficiency`| `m` | Active physical length of a single running step. |
| `bannister_trimp`| Bannister TRIMP | `load` | `points` | Exponentially weighted cardiovascular stress score. |
| `edwards_trimp` | Edwards TRIMP | `load` | `points` | Zone-weighted cardiovascular stress score. |
| `hrss` | HR Stress Score | `load` | `points` | Standardized HR-based Training Stress Score. |
| `rss` | Running Stress Score | `load` | `points` | Power-based Running Stress Score (Coggan model). |
| `tss` | Training Stress Score | `load` | `points` | Canonical consolidated training stress value. |
| `ctl` | Chronic Load (Fitness) | `recovery` | `points` | 42-day exponentially weighted fitness trend. |
| `atl` | Acute Load (Fatigue) | `recovery` | `points` | 7-day exponentially weighted fatigue trend. |
| `tsb` | Training Stress Balance| `recovery` | `points` | Current athletic form (CTL - ATL). |
| `monotony_7day` | 7-Day Monotony | `recovery` | `ratio` | Uniformity of training loads over last 7 days. |
| `strain_7day` | 7-Day Training Strain | `recovery` | `points` | Weekly training strain (Volume $\times$ Monotony). |
| `integrity_score` | Data Integrity Score | `data-quality`| `%` | Completeness, recording rate, and dropout indicator. |
