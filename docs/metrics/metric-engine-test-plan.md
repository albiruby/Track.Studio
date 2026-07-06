# Metric Engine Test Plan & Verification Strategy

This document outlines the validation schema, boundaries, and testing patterns for the Track.Studio Sports Science Metric Engine.

---

## 1. Test Scenarios

### 1.1 Zero Value Tests
- **Objective**: Ensure equations degrade gracefully without throwing division-by-zero or NaN errors.
- **Scenarios**:
  - Distance = 0 meters, duration = 0 seconds (zero-movement activities).
  - Average Power = 0 Watts.
  - Heart Rate = 0 bpm.

### 1.2 Null Value & Optional Fields Tests
- **Objective**: Ensure optional fields (e.g., resting heart rate, power, cadence, weather) are handled without runtime crashes.
- **Scenarios**:
  - Athlete has no resting HR or max HR configured.
  - Activity has null values for `averagePowerWatts`, `maxCadenceRpm`, or `calories`.
  - Streams (time, heart rate, power) are present but are completely null or empty arrays.

### 1.3 Missing Data & Dropout Tests
- **Objective**: Ensure sensor dropouts (loss of GPS, intermittent HR, power dropouts) do not crash the mathematical rolling averages or decoupling indexes.
- **Scenarios**:
  - The GPS Polyline is null.
  - 50% of the stream points have null heart rate readings.
  - Power stream starts after 10 minutes (sensor pairing delay).

### 1.4 Extreme Value & Boundary Tests
- **Objective**: Ensure the engine bounds mathematical outputs to realistic human physiological and physical constraints.
- **Scenarios**:
  - Activity maximum speed = 100 m/s (GPS spike).
  - Heart rate = 250 bpm.
  - Grade = 300% (altimeter spike).
  - Power = 3000 Watts.

### 1.5 Multi-Activity Timeline Tests (CTL, ATL, TSB)
- **Objective**: Verify that the chronic and acute training load calculations decay properly during rest periods.
- **Scenarios**:
  - High load run followed by 42 days of complete rest (verify CTL decays exponentially).
  - Large gap of 10 days between activities (verify timeline interpolation fills empty days with 0 load).

---

## 2. Test Execution Harness

The test suite runs programmatically using a dedicated, standalone TypeScript script (`/lib/metrics/tests/run-tests.ts`). 

This script compiles directly, evaluates a broad set of synthetic and realistic workout scenarios, and checks assertions using strict equality and delta comparison thresholds.
