# Track.Studio — Canonical Model Module

The **Canonical Model Module** is a critical architectural boundary in Track.Studio. It acts as the single source of truth for normalized physical data, shielding the core downstream engines (Metric Engine, Performance Engine, and Analysis Engine) from the complexity, schemas, naming conventions, and format variations of third-party sports APIs (Strava, Intervals.icu).

---

## 1. Architectural Philosophy

Our core architecture enforces a clean separation of concerns:

```
┌────────────────────────┐
│   Provider API Pull    │
└───────────┬────────────┘
            ▼
┌────────────────────────┐
│ Immutable Raw Storage  │ (rawData collection)
└───────────┬────────────┘
            ▼
┌────────────────────────┐
│    Provider Adapter    │ (Strava / Intervals.icu Adapters)
└───────────┬────────────┘
            ▼
┌────────────────────────┐
│  Normalization Engine  │ (Unit conversions, precision limits, timestamps)
└───────────┬────────────┘
            ▼
┌────────────────────────┐
│   Validation Engine    │ (Rejects corrupted or impossible values)
└───────────┬────────────┘
            ▼
┌────────────────────────┐
│  Canonical Repository  │ (canonical_ subcollections)
└────────────────────────┘
```

By decoupling the ingestion format from downstream evaluation, Track.Studio guarantees **reproducible results** and **source traceability** without overcomplicating data modeling.

---

## 2. Universal Canonical Objects

The module defines strict TypeScript contracts for the following sports domain concepts:

1. **Athlete (`CanonicalAthlete`)**: Stores the athlete profiles, FTP settings, gender, and metrics.
2. **Activity (`CanonicalActivity`)**: The core event record containing durations, paces, distances, sports type classification, weather, location, and metadata.
3. **Lap (`CanonicalLap`)**: High-resolution performance segments within an activity.
4. **Split (`CanonicalSplit`)**: 1-kilometer or 1-mile pace slices.
5. **Stream (`CanonicalStream`)**: Full time-series arrays representing sensor data (time, distance, latlng, heartrate, cadence, power, temp, etc.).
6. **Segment (`CanonicalSegment`)**: Starred or tracked physical routes matched during performance.
7. **Route (`CanonicalRoute`)**: Planned and saved GPS courses.
8. **Gear/Shoes (`CanonicalGear`)**: Athletic equipment and shoes tracker to log cumulative mileage.
9. **Workout (`CanonicalWorkout`)**: Standard targets for training runs (ingested without workout planning/scheduling).
10. **Heart Rate Zones / Power Zones**: Explicit arrays mapping intensity tiers.

---

## 3. Mapping Strategy & Traceability

### Strict Determinism
The mapping of provider data to canonical models is 100% deterministic and explainable. No heuristical inferences or black-box math models are allowed.

### Zero Loss of Raw Data
The original provider payloads are **never overwritten or modified**. The raw payload remains intact in the `rawData` collection.

### Source Traceability Invariant
Every canonical document is stamped with a `SourceMetadata` trace block that references:
- **Provider Name**: e.g., `'strava'` or `'intervals-icu'`.
- **Provider Object ID**: The unique ID from the third-party provider.
- **Raw Document ID**: The exact path reference to the unmutated `rawData` document in Firestore.
- **Sync Job ID**: The job that fetched the data.
- **API Endpoint**: The exact REST endpoint requested.
- **Payload Hash**: Deterministic hash of the raw response.
- **Provider API Version**: Version of the external endpoint.
- **Transformation Version**: Version of the Track.Studio normalization schema.

This trace block guarantees that any calculation can be completely reproduced from scratch starting with raw vendor data.
