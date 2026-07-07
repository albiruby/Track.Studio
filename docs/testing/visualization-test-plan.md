# Visualization Engine Test Plan

This document details the test scenarios, assertions, and verification commands for the Visualization Engine.

## Test Scenarios

### 1. Formatters Test
- **Objective**: Ensure distance, duration, speed, power, and pace values format correctly depending on metrics units.
- **Assertions**:
  - `10000m` formats to `10.00 km`.
  - `3661s` formats to `1:01:01`.
  - `4 m/s` formats to `4:10 /km` pace.

### 2. Axis Test
- **Objective**: Verify linear and logarithmic ticks generate mathematically correct bounds with adaptive densities.
- **Assertions**:
  - Linear ticks between `0` and `100` with `medium` density contain exactly `5` labels.

### 3. Tooltip Test
- **Objective**: Ensure tooltips assemble correct item representations and aria helpers.
- **Assertions**:
  - Comparison mode compiles balanced comparisons.

### 4. Legend Test
- **Objective**: Check sorting and visibility configurations.
- **Assertions**:
  - Items sorted alphabetically are returned in correct alphabetical order.

### 5. Accessibility Test
- **Objective**: Verify that screen-readable alternate tables are constructed with matching ViewModel columns.

---

## Executing Tests

Run the test suite using:

```bash
npm run test
```
This runs all Track.Studio tests including the Visualization Engine test module.
