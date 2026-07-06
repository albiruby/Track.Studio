# Formula Library - Scientific Specifications

This document catalogs the mathematical formulas, physiological rationale, and operational assumptions used in the Track.Studio Sports Science Metric Engine.

---

## 1. Physical Dimensions (Activity)

### Moving Pace
* **Mathematical Formula**:
  $$\text{Moving Pace} = \frac{\text{movingTimeSec}}{\left(\frac{\text{distanceMeters}}{1000}\right) \times 60} \quad [\text{decimal min/km}]$$
* **Scientific Rationale**: Standardizes speed into a runner-focused timescale (minutes per kilometer).
* **Assumptions**: Stationary pauses are accurately trimmed by auto-pause.
* **Limitations**: High GPS drift at low speeds (<1 m/s) can artificially inflate distance.

### Mechanical Work
* **Mathematical Formula**:
  $$\text{Work (kJ)} = \frac{\text{Average Power (Watts)} \times \text{Duration (seconds)}}{1000}$$
* **Scientific Rationale**: Relates continuous physical force (Watts) to cumulative kinetic energy output.
* **Assumptions**: Power data is integrated continuously over 1Hz intervals.
* **Limitations**: Highly dependent on the running power meter model calibration (Stryd, Garmin, Polar).

---

## 2. Advanced Pacing

### Pace Variability
* **Mathematical Formula**:
  $$\text{Pace CV} = \frac{\sigma_{\text{pace}}}{\mu_{\text{pace}}}$$
  Where $\sigma$ is the standard deviation and $\mu$ is the mean of pace values.
* **Scientific Rationale**: Measures pacing rhythm stability. Lower values indicate a steady-state run; higher values reflect intervals or extreme hills.
* **Assumptions**: Non-moving stops have been filtered.
* **Limitations**: Sharp corners and vertical climbs degrade pace stability metrics without athletic error.

### Critical Pace
* **Mathematical Formula**:
  $$\text{Critical Pace} = 1.05 \times \text{Pace}_{\text{Best 20-Min}}$$
  *(expressed as decimal minutes per kilometer)*
* **Scientific Rationale**: Corresponds to the maximal lactate steady state (MLSS) or threshold pace. A 20-minute maximal effort runs approximately 5% faster than true hour-long threshold pace.
* **Assumptions**: The athlete performed a near-maximal sustained 20-minute effort during the session or historical window.

---

## 3. Cardiovascular (Heart Rate)

### Cardiac Drift (HR Drift)
* **Mathematical Formula**:
  $$\text{Drift (\%)} = \frac{\mu_{\text{HR, Half 2}} - \mu_{\text{HR, Half 1}}}{\mu_{\text{HR, Half 1}}} \times 100$$
* **Scientific Rationale**: Under constant temperature and workload, heart rate naturally drifts upward (cardiovascular deconditioning, thermal strain, dehydration) as stroke volume decreases.
* **Assumptions**: Workload (Pace/Power) remained uniform across both halves of the run.
* **Limitations**: Sprints or major hills in the second half will spoof cardiac drift results.

### Aerobic Decoupling (Pa:Hr)
* **Mathematical Formula**:
  $$\text{Ratio} = \frac{\text{Speed (m/s)}}{\text{Heart Rate (bpm)}}$$
  $$\text{Decoupling (\%)} = \frac{\text{Ratio}_{\text{Half 1}} - \text{Ratio}_{\text{Half 2}}}{\text{Ratio}_{\text{Half 1}}} \times 100$$
* **Scientific Rationale**: Evaluates cardiovascular fitness by assessing whether heart rate rises disproportionately to the work done. A decoupling score $< 5.0\%$ represents mature aerobic conditioning.

---

## 4. Mechanical Power (Coggan Model)

### Normalized Power (NP)
* **Mathematical Formula**:
  1. $P_{30s} = \text{30-second rolling average of 1Hz power stream}$
  2. $P^4 = \text{Raise each element of } P_{30s} \text{ to the 4th power}$
  3. $\text{Mean}(P^4) = \text{Average of the 4th-powered values}$
  4. $\text{NP} = \sqrt[4]{\text{Mean}(P^4)}$
* **Scientific Rationale**: Models the physiological cost of exercise. Metabolic stress (lactate, glycogen depletion) increases exponentially (approximated by the 4th power) with intensity.
* **Assumptions**: 1Hz continuous power logging is complete.
* **Limitations**: Highly dynamic workouts with short, intense bursts can spike NP beyond physiological threshold capability.

---

## 5. Mechanical Efficiency

### Running Effectiveness (RE)
* **Mathematical Formula**:
  $$\text{RE} = \frac{\text{Average Speed (m/s)}}{\text{Specific Power (Watts/kg)}} \quad \left[\frac{\text{m/s}}{\text{W/kg}}\right]$$
* **Scientific Rationale**: Evaluates running economy by measuring how much speed is generated per Watt of specific power. Typical values range from $0.95$ to $1.05$.
* **Assumptions**: Athlete weight is accurate.
* **Limitations**: Steep downhills artificially inflate RE, while uphills deflate it.
