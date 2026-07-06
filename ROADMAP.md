# Track.Studio — Milestone-Based Roadmap

This roadmap defines the structured engineering journey from our current foundation to the complete production release of Track.Studio.

---

## Roadmap Overview

```
 ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
 │ M0: Baseline │ ───► │ M1-M2: Auth  │ ───► │M3-M4: Ingest │ ───► │M5-M7: Engine │
 └──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
                                                                          │
 ┌──────────────┐      ┌──────────────┐      ┌──────────────┐             │
 │ Launch / MVP │ ◄───  │M8-M9: Visual │ ◄─── │ M10: Options │ ◄──────────┘
 └──────────────┘      └──────────────┘      └──────────────┘
```

---

## Phase 1: Authentication & Integration Pipeline (Milestones 0–4)

### Milestone 0: Foundation Setup (Current)
- **Goal**: Configure standard runtime compiler, static paths, global variables, and system directory.
- **Deliverables**:
  - [x] TypeScript schemas and types configured under `/types/`.
  - [x] PostCSS + Tailwind CSS v4 styling rules integrated.
  - [x] Pure formulas and decay algorithm engines written.
  - [x] Zero-Trust Firestore security rules compiled.
- **Status**: `Completed`

### Milestone 1: Firebase Infrastructure Integration
- **Goal**: Provision live database instances and deploy secure transaction boundaries.
- **Deliverables**:
  - [ ] Connect Firestore and accept database terms via AI Studio.
  - [ ] Validate Firestore collection rules live using emulator/testing framework.
  - [ ] Deploy `/firestore.rules` ruleset to the target Firebase project.
- **Status**: `In Progress`

### Milestone 2: Google Authentication Lifecycle
- **Goal**: Establish secure registration and login sessions.
- **Deliverables**:
  - [x] Embed client authentication provider and context hook.
  - [ ] Build high-contrast, beautiful profile setup panel.
  - [ ] Enable athletes to set and save weight, rest HR, max HR, and FTP to Firestore profile documents.
- **Status**: `Partially Completed (UI Pending)`

### Milestone 3: Data Platform Handshakes
- **Goal**: Integrate third-party API OAuth flows to sync workouts.
- **Deliverables**:
  - [ ] Implement secure Strava client token callback and database refresh model.
  - [ ] Construct Intervals.icu API key connection panel.
  - [ ] Build manual upload form supporting standard FIT/GPX files (Deferred MVP backup).
- **Status**: `Pending`

### Milestone 4: Canonical Activity Ingestion
- **Goal**: Implement standard ingestion queue to parse and normalize activity payloads.
- **Deliverables**:
  - [ ] Build mapping pipeline taking raw Strava/Intervals JSON and writing to standard `NormalizedActivity`.
  - [ ] Securely cache high-frequency time-series streams (GPS velocity, heart rate, cadence) in compressed sub-documents.
- **Status**: `Pending`

---

## Phase 2: Analytics & Visual Presentation (Milestones 5–9)

### Milestone 5: Metric Engine Core Integration
- **Goal**: Link mathematical calculations to synchronized run streams.
- **Deliverables**:
  - [ ] Establish cloud trigger or background service calculating RSS on raw ingestion.
  - [ ] Generate `SingleActivityAnalysis` documents containing IF, EF, and pacing variability parameters.
- **Status**: `Pending`

### Milestone 6: High-Frequency Stream Analysis
- **Goal**: Implement stream-level calculations to compute drift and time-in-zones.
- **Deliverables**:
  - [ ] Write stream segmenters tracking first-half vs. second-half aerobic decoupling.
  - [ ] Calculate precise duration arrays spent in each of the 5 HR and pace zones.
- **Status**: `Pending`

### Milestone 7: Performance Decay Engine
- **Goal**: Translate multi-activity stress points into long-term fitness trend charts.
- **Deliverables**:
  - [ ] Execute daily CTL/ATL/TSB exponential moving average algorithm.
  - [ ] Generate rolling Peak Pace Curves from all historical stream caches.
- **Status**: `Pending`

### Milestone 8: Performance Dashboard Rendering
- **Goal**: Present performance indicators in a clean, highly polished slate-themed layout.
- **Deliverables**:
  - [ ] Embed Recharts dual-axis line chart tracking CTL, ATL, and TSB values over time.
  - [ ] Render key indicators (current fitness, acute fatigue, stress ramp rate) in visual stat cards.
- **Status**: `Pending`

### Milestone 9: Activities Ledger & Search
- **Goal**: Enable athletes to browse, search, and deep-dive individual activities.
- **Deliverables**:
  - [ ] Build data-dense grid listing all synchronized activities with multi-attribute dropdown filters.
  - [ ] Implement single activity deep-dive route presenting interactive timelines, cardiac drift line charts, and zone maps.
- **Status**: `Pending`

---

## Phase 3: Advanced Capabilities (Milestone 10+)

### Milestone 10: AI Trend Assistant (Future Roadmap)
- **Goal**: Build an optional, server-side Gemini interpreter allowing athletes to query their data.
- **Deliverables**:
  - [ ] Integrate server-side `@google/genai` handler proxies.
  - [ ] Create chat panel where users can ask conversational queries (e.g. "Summarize my cardiac efficiency over the last 3 weeks").
- **Status**: `Deferred (Future Scope)`
