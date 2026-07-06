# Track.Studio — Product Requirements Document (PRD)

---

## 1. Executive Summary

Track.Studio is an engineering-first, professional running performance analysis platform designed to replace opaque, closed-source sports telemetry engines with open, deterministic, and explainable models. The platform normalizes multi-source athletic activities, executes sports science calculations, and renders clear physiological trends to help athletes manage fitness, fatigue, and form over time.

---

## 2. Product Vision & Goals

### 2.1 Product Vision
To be the most transparent, reliable, and scientifically accurate running analysis tool available, giving athletes absolute clarity on their physical training stress, recovery markers, and performance trends without forced social networks, predatory gamification, or black-box predictive models.

### 2.2 Product Goals
- **Absolute Transparency**: Provide verifiable sports formulas where every metric can be calculated with a calculator using the exported raw stream data.
- **Unified Analytics**: Consolidate disparate data silos (Strava, Intervals.icu, local files) into one clean, responsive dashboard.
- **Zero Noise**: Eliminate social vanity metrics (likes, comments, feeds) to foster deep focused athletic evaluation.
- **Physiological Safety**: Provide clear markers for under-training, optimal training progression, and overtraining risk to reduce injuries.

---

## 3. Scope Boundaries

### 3.1 In-Scope (MVP Core)
- **Unified User Connection**: Google Auth login coupled with Firestore persistent profiles.
- **Physiological Threshold Settings**: Input field parameters for weight, resting heart rate, maximum heart rate, and Functional Threshold Pace (FTP).
- **Canonical Activity Normalization**: Standard ingestion, mapping, and caching of running data streams.
- **Pure Metric Calculations**:
  - Running Stress Score (RSS / rTSS equivalent).
  - Intensity Factor (IF).
  - Efficiency Factor (EF).
  - Aerobic Decoupling (Cardiac Drift percentage comparing 1st half to 2nd half).
  - Pacing Variability (Standard Deviation of speed stream relative to average speed).
- **Performance Model Generation**:
  - Chronic Training Load (CTL / Fitness) based on a 42-day exponential moving average.
  - Acute Training Load (ATL / Fatigue) based on a 7-day exponential moving average.
  - Training Stress Balance (TSB / Form) showing physical freshness.
  - Speed/Pace Duration Curve showing peak speeds across 30s, 1m, 5m, 20m, 1h.
- **High-Density Presentation**: Responsive charts showing load metrics over time, individual run breakdowns, time spent in training zones, and comparison tools.

### 3.2 Out of Scope (Strict Exclusions)
- **Social Features**: No comment feeds, friend requests, likes, activity sharing, or public boards.
- **Workout Planning & Calendars**: No calendar drag-and-drop interfaces, scheduling engines, or structured workout creators.
- **AI Coach Recommendations**: No system-generated training recommendations (e.g. "You should run 5km tomorrow"). AI must not write or schedule workouts.

---

## 4. Personas

### Persona A: The Analytical Athlete
- **Profile**: A competitive amateur runner or triathlete who trains 6–12 hours a week. They are obsessed with metrics, write training journals, and look closely at cardiac drift and FTP changes.
- **Needs**: Accurate TSS calculations, clear decoupling metrics for long aerobic runs, and a dynamic fitness/fatigue model to taper for their next race.
- **Pain Points**: Current platforms (Strava, etc.) hide performance charts behind paywalls or focus too much on social elements and GPS "segments" rather than physiological data.

### Persona B: The Endurance Coach
- **Profile**: A remote coach managing multiple running clients.
- **Needs**: A clean overview of an athlete's training load ramp rates to ensure clients do not increase load too fast, which leads to injury.
- **Pain Points**: Exporting CSVs from different platforms to calculate training stress manually in Excel is time-consuming and error-prone.

---

## 5. Functional Requirements

### 5.1 Authentication & Profile Management
| Ref ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-1.1** | Google OAuth | Allow user to sign in securely using Google OAuth via Firebase. | High |
| **FR-1.2** | Physiological Markers | User input interface to configure: weight (kg), Max HR (bpm), Resting HR (bpm), and Functional Threshold Pace (FTP, expressed in m/s or time per km). | High |
| **FR-1.3** | Automated Zones | System dynamically calculates 5 Heart Rate and 5 Pace training zones based on FTP and Max HR. | High |

### 5.2 Data Integration & Synchronization
| Ref ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-2.1** | Strava Connect | OAuth handshake to link Strava. Store access/refresh tokens securely. | High |
| **FR-2.2** | Intervals.icu Connect | Credentials input form (Athlete ID, API Read Key) to fetch raw workouts. | High |
| **FR-2.3** | Sync Queue | Trigger background retrieval of activities. Normalize raw JSON payloads to Track.Studio's Canonical schema. | High |
| **FR-2.4** | Stream Retrieval | Sync high-frequency time-series streams (time, distance, velocity, heartrate, cadence, altitude) for exact calculations. | High |

### 5.3 Deterministic Analysis Engine
| Ref ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-3.1** | RSS Math | Compute Running Stress Score dynamically for every activity using FTP and moving duration. | High |
| **FR-3.2** | Aerobic Decoupling | Segment the stream into first and second halves. Compare the Efficiency Factor (speed/HR) of both halves and output the drift %. | High |
| **FR-3.3** | Pacing Variability | Calculate standard deviation of speed stream divided by mean speed stream to check running pacing consistency. | Medium |
| **FR-3.4** | Time-in-Zones | Calculate exact duration (seconds) and percentage of time spent in each of the 5 HR and Pace zones. | High |

### 5.4 Performance Engine
| Ref ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-4.1** | CTL / ATL / TSB | Calculate daily CTL, ATL, and TSB values chronologically across the athlete's entire history of RSS scores. | High |
| **FR-4.2** | Ramp Rate | Compute the 7-day change rate of CTL to flag excessive training spikes. | Medium |
| **FR-4.3** | Peak Pace Curve | Search high-frequency streams across all historical activities to extract peak rolling average speed at 30s, 1m, 5m, 20m, 1h. | High |

### 5.5 Presentation Layer & Dashboard
| Ref ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-5.1** | Load Trend Chart | Interactive dual-axis line chart in Recharts showing CTL, ATL, and TSB filled-area over time. | High |
| **FR-5.2** | Activity Log | High-density grid of synchronized activities with filters (source, type, date range, search title). | High |
| **FR-5.3** | Detail View | Single activity deep-dive displaying raw telemetry, time-in-zones, cardiac drift chart, and pacing variability stats. | High |
| **FR-5.4** | Peak Curve Chart | Logarithmic speed/duration line chart plotting the athlete's record pacing boundaries. | Medium |

---

## 6. Non-Functional Requirements

### 6.1 Performance & Reliability
- **Responsive Navigation**: Transitions between dashboard views must be complete within < 100ms.
- **Offline Resiliency**: Ingested activities and trends are stored locally via React state/localStorage fallback when connection is disrupted.
- **Precision Math**: All calculations must use 64-bit floating-point arithmetic and be rounded to standard athletic conventions at the interface level.

### 6.2 Security & Compliance
- **Zero-Trust Access**: Firestore document access rules must strictly limit document reading and writing to the verified document owner (`request.auth.uid == userId`).
- **Secret Separation**: Third-party OAuth API keys must remain strictly in server-side configuration environments (Next.js server environments or API route handlers) and never be bundled into the client browser context.

### 6.3 UX & Accessibility
- **High Contrast**: Theme relies on solid slates and soft whites, achieving an absolute minimum contrast ratio of 4.5:1.
- **Screen Adaptability**: High-density desktop grids gracefully collapse to single-column card layouts on mobile viewports.

---

## 7. Canonical Data Mapping

```
[Raw Strava JSON]     ──┐
                        ├─►  [Data Platform Normalization]  ─► [Canonical Model] ─► [Firestore]
[Raw Intervals JSON]  ──┘
```

The Canonical Activity schema encapsulates raw source properties into fixed metric attributes to guarantee formula consistency:
- `distance`: Float (meters)
- `movingTime`: Integer (seconds)
- `elapsedTime`: Integer (seconds)
- `averageSpeed`: Float (meters per second)
- `averageHeartrate`: Integer or Null (beats per minute)
- `averageCadence`: Integer or Null (steps per minute)

---

## 8. Success Metrics

- **Synchronization Latency**: Incremental syncing of 10 recent activities takes less than 3 seconds under normal API loads.
- **Formula Accuracy**: Mathematical calculations of CTL/ATL exactly match reference implementations with a deviation of less than 0.1%.
- **Client Render Speed**: High-frequency streaming charts containing > 10,000 coordinate points render fluidly at 60fps on average mobile devices.
- **Retention**: Zero dropped raw data metrics during platform migration or sync.
