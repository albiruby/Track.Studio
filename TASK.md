# Track.Studio — Task & Engineering Epic Tracker

This file serves as the core master backlog and task board for Track.Studio. All engineering tasks are categorized under functional Epics.

---

## Epic 1: Architectural Foundation

### Task FD-1: TypeScript Configurations & Core Types
- **Description**: Configure end-to-end static types, paths, and strict compiler properties. Define domain structures.
- **Priority**: Critical
- **Dependencies**: None
- **Acceptance Criteria**:
  - `tsconfig.json` has `strict: true` and defines `@/*` paths matching the workspace root.
  - Types for data-platform, athlete, analysis, and performance domains are declared under `/types/` without any `any` declarations.
- **Status**: Completed

### Task FD-2: Next.js Viewport Layout & Global Styles
- **Description**: Set up RootLayout with Inter and JetBrains Mono fonts, Tailwind global CSS, and dynamic viewport structure.
- **Priority**: High
- **Dependencies**: FD-1
- **Acceptance Criteria**:
  - `layout.tsx` imports CSS, sets fonts, and applies base theme color variables.
  - `globals.css` imports Tailwind configuration. No style warnings on compile.
- **Status**: Completed

---

## Epic 2: Authentication & Profile Management

### Task AU-1: Firebase Authentication Client Bootstrap
- **Description**: Setup client-side authentication provider and state context to monitor current user login status.
- **Priority**: High
- **Dependencies**: FD-2
- **Acceptance Criteria**:
  - `/providers/firebase-provider.tsx` exports `FirebaseProvider` and `useFirebase` hook.
  - Correct state management for user login, loading, and registration configurations.
- **Status**: Completed

### Task AU-2: User Profile Settings UI
- **Description**: Build user configuration form allowing athletes to enter body weight, max HR, resting HR, and FTP.
- **Priority**: High
- **Dependencies**: AU-1
- **Acceptance Criteria**:
  - Form validation ensures weight and HR fields do not accept out-of-bounds or invalid values.
  - Saving the profile writes directly to `/athleteProfiles/{userId}` in Firestore using standard formats.
- **Status**: Pending

---

## Epic 3: Firebase Infrastructure Setup

### Task FB-1: Firestore Database Schema Definition
- **Description**: Model core schemas for activities, analyses, trends, and athlete profiles in a central blueprint.
- **Priority**: High
- **Dependencies**: FD-1
- **Acceptance Criteria**:
  - Create `/firebase-blueprint.json` defining properties and required fields.
- **Status**: Completed

### Task FB-2: Zero-Trust Security Rules Deployment
- **Description**: Write secure, zero-trust rules verifying authentication, field structures, and document ownership.
- **Priority**: Critical
- **Dependencies**: FB-1
- **Acceptance Criteria**:
  - `/firestore.rules` enforces restricted write and read actions for `athleteProfiles`, `activities`, `analyses`, and `trends`.
  - Document IDs are verified against size limits and regex requirements to prevent malicious injection.
- **Status**: Completed

---

## Epic 4: Data Platform (Integrations & Normalization)

### Task DP-1: Strava API Handshake Integration
- **Description**: Create API routes under `/app/api/auth/strava` handling code exchange and refresh token loops.
- **Priority**: High
- **Dependencies**: FB-2
- **Acceptance Criteria**:
  - Server-side handler proxies requests to Strava token endpoints safely using private environment credentials.
  - Tokens are encrypted or safely stored in user's `/athleteProfiles` private fields.
- **Status**: Pending

### Task DP-2: Intervals.icu Credentials Configuration
- **Description**: Add credentials input for Athlete ID and API Read Key. Validate connection status.
- **Priority**: High
- **Dependencies**: AU-2
- **Acceptance Criteria**:
  - Connect settings panel lets users input their credentials, testing the API handshake prior to saving.
- **Status**: Pending

### Task DP-3: Canonical Activity Sync Queue
- **Description**: Construct scheduler/sync worker pulling raw activity payloads and mapping them to `NormalizedActivity`.
- **Priority**: High
- **Dependencies**: DP-1, DP-2
- **Acceptance Criteria**:
  - Raw JSON variables map cleanly to floats (meters, seconds, m/s).
  - Normalization engine preserves original source payloads in metadata.
- **Status**: Pending

---

## Epic 5: Analysis Engine (Single Activity Math)

### Task AN-1: Pure Formula Math Library
- **Description**: Implement mathematical formulas for RSS, Intensity Factor, Efficiency Factor, and cardiac drift.
- **Priority**: High
- **Dependencies**: FD-1
- **Acceptance Criteria**:
  - Formula calculations in `/lib/analysis/formulas.ts` match standard sports science reference outcomes.
  - Decoupling logic parses stream lists and outputs correct percentage drift between halves.
- **Status**: Completed

### Task AN-2: High-Frequency Stream Processing
- **Description**: Create stream processors that parse GPS velocity, altitude, and heart rate coordinates to identify peaks and variability.
- **Priority**: Medium
- **Dependencies**: AN-1
- **Acceptance Criteria**:
  - Stream functions output accurate values for pacing variability (coefficient of variation of velocity stream).
  - Time-spent-in-zones calculates exact duration for each of the 5 heart rate and pace zones.
- **Status**: Pending

---

## Epic 6: Performance Engine (Multi-Workout Trends)

### Task PE-1: Exponential Training Load Models (CTL / ATL / TSB)
- **Description**: Implement decay equations modelling Chronic Training Load, Acute Training Load, and Training Stress Balance.
- **Priority**: High
- **Dependencies**: AN-1
- **Acceptance Criteria**:
  - `/lib/performance/algorithms.ts` provides exponential decay trend lines over historical stress logs.
  - Outputs match standard Banister/Coggan models (42-day CTL, 7-day ATL).
- **Status**: Completed

### Task PE-2: Historical Record Curves (Peak Pace Curve)
- **Description**: Scan activity streams over time to find record rolling averages for critical training intervals (30s, 1m, 5m, 20m, 1h).
- **Priority**: Medium
- **Dependencies**: AN-2
- **Acceptance Criteria**:
  - System extracts Peak Paces and returns dates/activity references for each peak interval.
- **Status**: Pending

---

## Epic 7: Presentation Layer (UI Dashboard & Views)

### Task PL-1: High-Contrast Slate Theme Shell
- **Description**: Assemble modern, high-contrast dashboard framework with responsive side navigation and metric cards.
- **Priority**: High
- **Dependencies**: FD-2
- **Acceptance Criteria**:
  - Responsive layouts render correctly without overlapping content down to 320px width viewports.
  - High density grids align text using standard Inter metrics.
- **Status**: Completed

### Task PL-2: Historical Load Trend Chart (Recharts)
- **Description**: Construct interactive filled-area chart for CTL, ATL, and TSB on the dashboard.
- **Priority**: High
- **Dependencies**: PE-1, PL-1
- **Acceptance Criteria**:
  - Chart allows zooming, panning, and toggling specific datasets.
  - Clean tooltips render exact date values when hovered.
- **Status**: Pending

### Task PL-3: Activity Details Deep-Dive View
- **Description**: Design specific route displaying heart rate, elevation profiles, cardiac drift stats, and pace-zone breakdown tables.
- **Priority**: High
- **Dependencies**: AN-2, PL-1
- **Acceptance Criteria**:
  - Renders multi-stream timelines synchronously under hover states.
  - Zone durations translate beautifully to high-contrast progress bars.
- **Status**: Pending

---

## Epic 8: Search, Filters & Data Health

### Task SF-1: Advanced Activity Filter & Search
- **Description**: Build client-side text-searching and dropdown filtering controls for synchronized activities.
- **Priority**: Medium
- **Dependencies**: PL-1
- **Acceptance Criteria**:
  - Filter by date ranges, sport type, distance criteria, or titles.
- **Status**: Pending

### Task SF-2: Data Quality & Anomalies Inspector
- **Description**: Implement sanity boundaries flagging activities with corrupt GPS data or faulty optical HR.
- **Priority**: Low
- **Dependencies**: DP-3
- **Acceptance Criteria**:
  - Warns athletes if runs contain missing streams or spikes exceeding physical human boundaries.
- **Status**: Pending

---

## Epic 9: Testing & Release

### Task TR-1: Unit Testing Mathematical Models
- **Description**: Develop unit tests checking pure formulas and decay algorithms.
- **Priority**: High
- **Dependencies**: AN-1, PE-1
- **Acceptance Criteria**:
  - Checks RSS equations, cardiac drift, and banister loads under deterministic test inputs.
- **Status**: Pending

### Task TR-2: Production Build Pipeline Verification
- **Description**: Validate compile optimizations, package tree shaking, and standalone target deployments.
- **Priority**: High
- **Dependencies**: None
- **Acceptance Criteria**:
  - `npm run build` is successful, outputting static files without any errors.
- **Status**: Completed
