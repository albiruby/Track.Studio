# Track.Studio — Canonical Schema Architecture

This document specifies the database schemas, collection hierarchies, and versioning rules implemented for canonical models in Firestore.

---

## 1. Firestore Database Schema

To enforce strict multi-tenant isolation and secure user data, all canonical records are nested under the corresponding user's root document. This matches the standard structure of raw records:

```
users/
└── {userId}/
    ├── canonical_athletes/
    │   └── {athleteId}              <-- Normalized Athlete profile
    ├── canonical_activities/
    │   └── {activityId}             <-- Normalized Activity summaries
    ├── canonical_laps/
    │   └── {lapId}                  <-- Activity lap breakdowns
    ├── canonical_splits/
    │   └── {splitId}                <-- 1km or 1mi metric splits
    ├── canonical_streams/
    │   └── {activityId}             <-- Sensor timeseries data arrays
    ├── canonical_gear/
    │   └── {gearId}                 <-- Shoes and hardware miles
    ├── canonical_routes/
    │   └── {routeId}                <-- GPS tracks and routes
    └── canonical_metadata/
        └── global                   <-- Global schema configuration state
```

---

## 2. Field Dictionary & Type Specification

### CanonicalActivity
```typescript
interface CanonicalActivity {
  id: string;                      // Unique ID, e.g., 'strava_123456789'
  externalProviderId: string;      // 'strava' | 'intervals-icu'
  providerObjectId: string;        // Raw ID on external system, e.g., '123456789'
  athleteId: string;               // Internal user ID (matches Auth UID)
  activityName: string;            // Name of activity
  sportType: 'running' | 'trail_running' | 'other';
  startDate: string;               // ISO 8601 UTC timestamp
  timezone: string;                // IANA timezone identifier, e.g. 'Europe/Paris'
  elapsedTimeSec: number;          // Total duration including pauses
  movingTimeSec: number;           // Actual time spent moving
  distanceMeters: number;          // Total distance
  averagePaceMinPerKm: number;     // Decimals: minutes per kilometer
  averageSpeedMps: number;         // Speed in meters/sec
  maximumSpeedMps: number;         // Max speed in meters/sec
  elevationGainMeters: number;     // Total vertical ascent
  elevationLossMeters: number;     // Total vertical descent
  averageHeartRateBpm: number|null;// Mean heart rate
  maxHeartRateBpm: number|null;    // Peak heart rate
  averageCadenceRpm: number|null;  // Mean RPM/steps per minute (one foot)
  maxCadenceRpm: number|null;      // Peak RPM
  averagePowerWatts: number|null;  // Mean power output
  maxPowerWatts: number|null;      // Peak power output
  calories: number | null;         // Total calorie burn
  device: CanonicalDevice;         // Sensor hardware description
  shoesId: string | null;          // Reference shoe identifier
  gpsPolyline: string | null;      // Compressed Map Polyline string
  visibility: 'public' | 'followers_only' | 'only_me';
  privateFlag: boolean;            // Private marker
  manualFlag: boolean;             // True if uploaded without GPS trace
  commuteFlag: boolean;            // Commute marker
  trainerFlag: boolean;            // True if recorded indoors
  kilojoules: number | null;       // Total work in kilojoules
  weather: CanonicalWeather | null;// Temperature/Humidity indices
  location: CanonicalLocation;     // Country/State/City start and end points
  elevation: CanonicalElevation;   // Minimum and maximum altitudes
  achievements: CanonicalAchievement[];
  bestEfforts: CanonicalBestEffort[];
  sourceMetadata: SourceMetadata;  // Ingestion traceability stamp
  metadata: CanonicalMetadata;      // Schema configuration block
  createdAt: string;               // Date records created
  updatedAt: string;               // Date records updated
}
```

---

## 3. Versioning Policy

To avoid breaking compatibility when expanding or altering fields in future updates, the module implements a explicit **Schema Versioning Policy**:

- **Semantic Versioning**: The canonical schemas carry a `schemaVersion` parameter (currently `1.0.0`).
- **No In-Place Breaking Mutations**: Changes that remove fields or alter fundamental types require a major version bump. Minor version bumps (e.g., `1.1.0`) can only add non-required properties.
- **Transformation Tracking**: The `transformationVersion` tracking tracks code changes within normalizer adapters independently from the physical database structure.
- **Migration Strategy**: If the schema is upgraded, a migration thread can query old schema records by filtering on the `metadata.schemaVersion` tag, mapping old structures to the new layout safely.
