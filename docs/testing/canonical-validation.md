# Track.Studio — Canonical Validation & Test Plan

This document outlines the validation rules, error handling strategies, and automated tests executed to guarantee the physical accuracy of the Canonical Data Model.

---

## 1. Validation Architecture

Validation is performed after data normalization but before writing to Firestore.

The `ValidationEngine` evaluates objects against hard-boundary rules to classify them as either **Valid** (safe for persistence) or **Invalid** (must be rejected to prevent corrupting performance analyses).

```
[ Normalized Canonical Object ]
               │
               ▼
┌──────────────────────────────┐
│     ValidationEngine         ├───────► Valid?
└──────┬────────────────┬──────┘           │
       │                │                  ├──► YES ──► Write to Firestore
       ▼ (Errors)       ▼ (Warnings)       │
┌──────────────┐ ┌──────────────┐          └──► NO  ──► Save to Ingestion Errors
│ Reject Write │ │ Log Warning  │
└──────────────┘ └──────────────┘
```

---

## 2. Hard Validation Rules (Errors)

The `ValidationEngine` will immediately **reject** objects that fail any of these conditions:

1. **Missing Identifiers**: Any object missing its `id`, `athleteId`, or required parent references (e.g. `activityId` on laps or streams) is rejected.
2. **Invalid Timestamps**: Dates that are malformed, unparseable, or empty are rejected.
3. **Negative Bounds**: Dimensions like `distanceMeters`, `elapsedTimeSec`, `movingTimeSec`, `averageSpeedMps`, or `elevationGainMeters` cannot be negative.
4. **Invalid GPS Coordinates**: Latitudes must fall strictly in $[-90.0, 90.0]$ and longitudes in $[-180.0, 180.0]$.
5. **Unknown Enums**: Fields like `sportType` or `visibility` must be members of standard allowed categories.
6. **Impossible Durations**: If `movingTimeSec` exceeds `elapsedTimeSec` (an physical impossibility).
7. **Malformed Sensor Streams**: Timeseries arrays (distance, heartrate, cadence, power) must exactly match the length of the parent `timeSec` coordinate stream. Mismatched lengths indicate corrupted file encoding and are rejected.

---

## 3. Soft Validation Rules (Warnings)

Readings that are physically rare but theoretically possible trigger a **Warning** but are allowed to persist. This prevents blocking rare performances (e.g., ultramarathons) while catching sensor issues:

- **Ultra-Durations**: Any run with an elapsed duration exceeding 48 hours ($172,800$ seconds).
- **Extreme Distances**: A single run exceeding 500 kilometers ($500,000$ meters).
- **Impossible Running Speeds**: Maximum speed exceeding $30 \text{ m/s}$ ($108 \text{ km/h}$).
- **Physically Unlikely Heart Rates**: Resting heart rates below $25 \text{ bpm}$ or maximum heart rates above $240 \text{ bpm}$.

---

## 4. Test Scenarios

These test cases verify the behavior of the `ValidationEngine`:

### Test Case 1: Perfect Strava Run Ingest
- **Input**: Valid raw Strava road run payload.
- **Expected Outcome**: Normalizes speed and metrics successfully; zero errors; passes validation with `isValid: true`.

### Test Case 2: Negative Distances or Durations
- **Input**: Raw JSON showing `distance: -12.5` or `moving_time: -300`.
- **Expected Outcome**: Normalization keeps negative value; `ValidationEngine` flags `distanceMeters cannot be negative`; `isValid` is `false`; database save is bypassed.

### Test Case 3: GPS Coordinate Drift Spill
- **Input**: Stream coordinates showing Latitude `140.23` or Longitude `-240.23`.
- **Expected Outcome**: `ValidationEngine` captures invalid latitude/longitude range error; `isValid` is `false`.

### Test Case 4: Mismatched Stream Lengths
- **Input**: Stream timeseries payload containing 1000 time points but only 950 heart rate points.
- **Expected Outcome**: `ValidationEngine` flags mismatched stream sizes; `isValid` is `false`.
