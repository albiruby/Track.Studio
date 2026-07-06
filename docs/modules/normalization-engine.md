# Track.Studio — Normalization Engine Module

The **Normalization Engine** is a deterministic processing block that unifies formatting variations, units of measurement, coordinates, and enum schemas across different provider payloads into a single standard.

---

## 1. Core Responsibilities

The Normalization Engine executes several mandatory transformation rules:

| Domain | Raw Input (Varies) | Canonical Output (Standard) |
| :--- | :--- | :--- |
| **Duration** | Any number or format | Seconds (`number`) |
| **Distance** | Miles, Kilometers, Feet, Meters | Meters (`number`) |
| **Speed** | mph, km/h, m/s | Meters per Second (`number`) |
| **Pace** | formatted string, min/mi, sec/km | Decimals in min/km (`number`), e.g., 5.5 = 5:30/km |
| **Elevation** | Feet or Meters | Meters (`number`) |
| **Power** | Watts, raw decimals | Rounded Watts (`number`), limit < 2500W |
| **Cadence** | Double-foot (spm) or Single-foot (rpm) | RPM/Strides (`number`), limit < 220 |
| **Heart Rate** | String or decimals | Rounded Beats per Minute (`number`), range 30-250 |
| **Temperature** | Fahrenheit or Celsius | Celsius (`number`), rounded to 1 decimal place |
| **Coordinates** | Double, Float, varying decimals | 6 decimal places (~10cm precision) |
| **Timezones** | GMT offset names, short strings, abbreviations | IANA Database Timezone names (e.g. `America/New_York`) |
| **Timestamps** | Epoch, raw strings, local formats | UTC ISO 8601 string (`YYYY-MM-DDTHH:mm:ss.sssZ`) |
| **Enums** | Provider-specific strings | Strict TypeScript Unions |

---

## 2. Mathematical Transformation & Unit Rules

### Decimal Pace Calculation
Downstream analysis engines require a numerical decimal pace represented as minutes per kilometer (min/km).
- Conversion Formula from speed in meters per second ($v_{mps}$):
  $$\text{Pace}_{\text{dec}} = \frac{1000}{v_{mps} \times 60}$$
- Example: $4.0 \text{ m/s} \implies \frac{1000}{240} = 4.1667 \text{ min/km}$ (which is exactly $4\text{m } 10\text{s per km}$).

### Coordinate Precision Standard
To save payload size and avoid micro-flickering in map layers, all coordinates are rounded to exactly 6 decimal places:
$$\text{Coord}_{\text{norm}} = \frac{\text{round}(\text{Coord} \times 10^6)}{10^6}$$
This maintains high-fidelity precision within ~10 centimeters of exact coordinates.

### Physical Limiter Anchors
To prevent corrupt sensor anomalies (e.g., GPS drift spikes or heart rate monitor connectivity failures), the Normalizer caps and cleans incoming metric dimensions:
- **Heart Rate**: Must fall within $[30, 250]$ bpm. Anomalous readings outside this range are safely nullified.
- **Power**: Capped at $2500 \text{ Watts}$.
- **Cadence**: Strides/revolutions per minute are capped at $220 \text{ rpm}$.

---

## 3. Provider Enum Mapping Strategy

### Sport Types
The engine normalizes heterogeneous vendor sport designations into three core categories:
1. `running`: Any standard road run, jog, treadmill run, or track session.
2. `trail_running`: Off-road trail sessions.
3. `other`: Unsupported sports (cycling, swimming, walking) to prevent polluting core metrics.

### User Visibility
Unifies social profiles:
- Strava `everyone`, `followers`, `only_me` $\implies$ `public`, `followers_only`, `only_me`.
- Intervals.icu `private` flag $\implies$ `only_me` or `public`.
