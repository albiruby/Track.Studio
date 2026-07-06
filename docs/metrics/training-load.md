# Training Load Methodologies - Scientific Specifications

Track.Studio’s Sports Science Metric Engine implements six primary physical and cardiovascular training stress load models, satisfying various sensor configurations.

---

## 1. Bannister TRIMP (Training Impulse)

### Mathematical Formula
$$w = T \times y \times e^{b \cdot y}$$
Where:
- $T$ = Duration in minutes
- $y$ = Fractional HR Reserve:
  $$y = \frac{\text{HR}_{\text{avg}} - \text{HR}_{\text{rest}}}{\text{HR}_{\text{max}} - \text{HR}_{\text{rest}}}$$
- $b$ = Exponential weighting constant:
  - $b = 1.92$ (Male)
  - $b = 1.67$ (Female)

### Physiological Context
Bannister's TRIMP models the exponential rise in cardiovascular fatigue at high heart rates. It uses the heart rate reserve (HRR) to normalize the workload to individual physiology.

---

## 2. Edwards TRIMP

### Mathematical Formula
$$\text{Edwards TRIMP} = \sum_{i=1}^{5} \left( \text{Time in Zone}_i \times \text{Multiplier}_i \right)$$
Where:
- $\text{Time in Zone}_i$ is expressed in minutes.
- Multipliers:
  - **Zone 1** (50-60% Max HR): Multiplier = 1
  - **Zone 2** (60-70% Max HR): Multiplier = 2
  - **Zone 3** (70-80% Max HR): Multiplier = 3
  - **Zone 4** (80-90% Max HR): Multiplier = 4
  - **Zone 5** (90-100% Max HR): Multiplier = 5

### Physiological Context
This zone-weighted model penalizes duration spent in higher intensity bands while remaining simple and robust when average heart rate suffers from high variance or signal dropout.

---

## 3. Lucia TRIMP

### Mathematical Formula
$$\text{Lucia TRIMP} = \sum_{j=1}^{3} \left( \text{Time in Zone}_j \times \text{Multiplier}_j \right)$$
Where:
- **Zone I** (<70% Max HR): Multiplier = 1
- **Zone II** (70-85% Max HR): Multiplier = 2
- **Zone III** (>85% Max HR): Multiplier = 3

### Physiological Context
Based on ventilator thresholds (VT1 and VT2), Lucia's TRIMP models the transitions between aerobic, anaerobic, and lactate threshold zones.

---

## 4. Heart Rate Stress Score (HRSS)

### Mathematical Formula
$$\text{HRSS} = \frac{\text{Duration (seconds)} \times y \times e^{b \cdot y}}{3600} \times 100$$
Where:
- $y$ = Fractional HR Reserve
- $b$ = $1.92$ (Male), $1.67$ (Female)

### Physiological Context
Normalizes cardiovascular load so that 1 hour of sustained training at lactate threshold heart rate equals exactly 100 points.

---

## 5. Running Stress Score (RSS)

### Mathematical Formula
$$\text{RSS} = 100 \times \frac{\text{Duration (seconds)} \times \text{NP} \times \text{IF}}{3600 \times \text{FTP}}$$
Where:
- $\text{NP}$ = Normalized Power (Watts)
- $\text{IF}$ = Intensity Factor = $\frac{\text{NP}}{\text{FTP}}$
- $\text{FTP}$ = Functional Threshold Power (Watts)

### Physiological Context
The standard power-based training stress metric. It accounts for the exponential cost of running above threshold power, modeling glycogen depletion and muscle tissue strain.

---

## 6. Training Stress Score (TSS)

### Mathematical Formula
$$\text{TSS} = \begin{cases} \text{RSS} & \text{if power is present} \\ \text{HRSS} & \text{otherwise} \end{cases}$$

### Physiological Context
Serves as the unified, canonical currency of training load across Track.Studio, driving chronic fitness (CTL) and acute fatigue (ATL) models.
