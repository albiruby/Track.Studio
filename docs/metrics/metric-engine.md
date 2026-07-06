# Sports Science Metric Engine - Core Architecture Documentation

Track.Studio’s Sports Science Metric Engine is a deterministic, highly standardized mathematical library. It transforms normalized, canonical data structures into reproducible athletic performance metrics. It operates completely independently of UI elements, databases (such as Firestore), and vendor API interfaces.

---

## 1. Core Architectural Pipeline

The Metric Engine functions in a strict, unidirectional processing stream, adhering to sports science formulas and type safety.

```
Canonical Repository 
        ↓
   Metric Engine
        ↓ (Resolves & Evaluates)
  Formula Library
        ↓ (Maps Metadata & Units)
   Metric Registry
        ↓ (Saves/Caches)
  Metric Repository (In-Memory/Persistent Cache)
        ↓
Analysis & Presentation Layers
```

---

## 2. Key Architecture Principles

1. **Deterministic Execution**: The exact same inputs (Canonical Activity, Athlete, Streams) must produce the exact same metric values across every run. No floating heuristics or randomized estimates.
2. **Strict Structural Isolation**: The engine cannot perform fetch calls, query databases, or import React components. It is a pure mathematical library.
3. **Traceability**: Every computed metric encapsulates standard provenance metadata:
   - Unique identifier of the athlete (`athleteId`)
   - Optional identifier of the activity (`activityId`)
   - Specific calculation timestamp
   - The exact semantic versions of the formula and engine mappings
   - Array of specific input parameters and streams referenced
4. **Semantic Versioning**: All formulas support explicit semantic versioning (e.g. `1.0.0`). Future adjustments to equations or conversions register under a new version, preventing historical training logs from being silently rewritten or corrupted.
5. **Robust Boundary Defensiveness**: The engine must remain functional when facing null values, partial stream GPS dropouts, or single-sensor failures. Fallbacks are explicit, documented, and safe.

---

## 3. Directory Structure

- `/lib/metrics/types.ts`: Core TypeScript interface declarations (e.g., `ComputedMetric`, `MetricDefinition`).
- `/lib/metrics/registry.ts`: The central database catalog of all metrics, associating unique IDs to calculation handles and definitions.
- `/lib/metrics/engine.ts`: Orchestration class (`MetricEngine`) mapping raw canonical models to registry targets.
- `/lib/metrics/repository.ts`: Clean, decoupled storage layout allowing queries, categories, and chronological trend series.
- `/lib/metrics/formulas/`: Pure functional implementations separated by domain:
  - `activity.ts`: Distance, duration, speed, work, gross paces.
  - `pacing.ts`: Standard deviations, stability, splits, critical pace.
  - `heart-rate.ts`: Zones, HRR, drift, aerobic decoupling.
  - `power.ts`: Coggan Normalized Power (NP), Variability Index (VI).
  - `cadence.ts`: Stride frequencies, step-distribution.
  - `elevation.ts`: Climbing speed, grade percentages, VAM.
  - `load.ts`: Comprehensive TRIMP and RSS/TSS stress indexes.
  - `efficiency.ts`: Running Effectiveness (RE) and Stride Length efficiency.
  - `consistency.ts`: Weekly/monthly training stability and CV metrics.
  - `performance.ts`: Peak VO2Max and distance effort trends.
  - `recovery.ts`: CTL, ATL, TSB exponentially weighted fatigue trends.
  - `environmental.ts`: Steadman Apparent Temperature heat index.
  - `data-quality.ts`: GPS coverage and sensor drop reliability indicators.
