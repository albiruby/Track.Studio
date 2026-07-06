# Track.Studio — Running Performance Analysis Platform

Track.Studio is a high-performance running analysis platform engineered for athletes, coaches, and sports scientists. The application focuses exclusively on data acquisition, normalization, deterministic calculation of physiological fatigue/fitness metrics, and performance evaluation.

---

## 1. Project Overview & Vision

Track.Studio is designed from the ground up to solve the "black-box" problem inherent in modern sports analytics. Rather than relying on proprietary, opaque algorithms, Track.Studio provides transparent, deterministic, and explainable metrics based on validated athletic training literature.

The platform functions as an engineering-driven ecosystem that connects with external training platforms and physical files to normalize raw performance feeds into a unified canonical schema, calculate exact training stress indicators, and visualize multi-workout physiological adaptation.

### Platform Boundaries (What Track.Studio is NOT)
To maintain structural focus and technical excellence, Track.Studio strictly limits its scope:
- **NOT a Social Network**: There are no social feeds, likes, followers, public profiles, or comments.
- **NOT a Workout Planner**: No training calendar scheduling, interactive calendar dragging, or manual workout builders.
- **NOT an AI Coach**: No automated training plan generation or machine-generated daily schedule adjustments.
- **Optional AI Scope**: AI is constrained to natural language analysis, query translation, and semantic interpretation of historical trends, never as a core state manager or metrics engine.

---

## 2. Core Product Principles

All engineering efforts must adhere strictly to the following principles:

- **Real Data Only**: No fake, placeholder, or fabricated training metrics. If data is absent, present a clear connected status empty state.
- **No Fake Data**: Every statistic and graph must map directly to raw data streams or mathematical derivatives.
- **Deterministic & Explainable**: Every calculated metric (e.g., RSS, Intensity Factor, CTL, ATL, TSB) is derived using standard, open sports science formulas.
- **Canonical Data Model**: A single source of truth for all synchronized runs, regardless of data source (Strava, Intervals.icu, GPX, etc.).
- **Preserve Raw Data**: Keep raw payloads from integration sources in their original, pristine form in standard storage fields.
- **Privacy First**: Athlete training metrics, locations, and profile configurations belong exclusively to the athlete.
- **Professional UI**: Minimalist, high-contrast, data-dense interface utilizing a professional slate theme with clear typography.
- **Type Safety**: Strictly typed TypeScript schemas across all layers—from raw API responses to presentation hooks.

---

## 3. Technology Stack

Track.Studio utilizes a modern, robust, and highly scalable cloud-native stack:

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15+ (App Router) | React server components, optimized routing, standalone deployment |
| **Language** | TypeScript 5+ | End-to-end static typing and schema verification |
| **Database** | Cloud Firestore | Real-time, scalable NoSQL persistent storage with zero-trust security rules |
| **Authentication** | Firebase Authentication | Google OAuth & secure identity lifecycle management |
| **Styling** | Tailwind CSS v4 | High-contrast visual design, fluid grid layouts, ultra-fast styling |
| **Animations** | Motion (from `motion/react`) | Fluid route transitions and micro-interaction visual feedback |
| **Charts** | Recharts | Interactive and performant performance metrics data visualization |
| **Icons** | Lucide React | Consistent, lightweight vector iconography |

---

## 4. Architecture Overview

The system architecture is strictly segregated into five independent domains:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Track.Studio Core Engine                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐
│     Data Platform     │       │    Analysis Engine    │       │  Performance Engine   │
│   (@/lib/data-platform)│      │    (@/lib/analysis)   │       │  (@/lib/performance)  │
├───────────────────────┤       ├───────────────────────┤       ├───────────────────────┤
│ • OAuth / Tokens      │       │ • Pure Formula Lib    │       │ • CTL/ATL/TSB Decay   │
│ • Sync Queue Manager  │       │ • Pacing Variability  │       │ • Peak Pace Curve     │
│ • Canonical Schema    │       │ • Aerobic Decoupling  │       │ • Ramp Rate Models    │
│ • Zero-Trust Rules    │       │ • Intensity/RSS Calc  │       │ • Historical Trends   │
└───────────┬───────────┘       └───────────┬───────────┘       └───────────┬───────────┘
            │                               │                               │
            └───────────────────────────────┼───────────────────────────────┘
                                            ▼
                                ┌───────────────────────┐
                                │  Presentation Layer   │
                                │  (@/components & app) │
                                ├───────────────────────┤
                                │ • High-Contrast Slate │
                                │ • Interactive Recharts│
                                │ • Density-First Grid  │
                                └───────────────────────┘
```

1. **Data Platform (`@/lib/data-platform/`)**: Token exchange, credentials validation, activity queue sync, schema verification, and canonical normalization.
2. **Analysis Engine (`@/lib/analysis/`)**: Mathematical execution of single-activity metrics (Pacing Variability, Decoupling, Intensity, RSS).
3. **Performance Engine (`@/lib/performance/`)**: Multi-workout historical trend generation (CTL, ATL, TSB calculations, Peak Pace curves).
4. **Presentation Layer (`@/components/` & `@/app/`)**: High-contrast, dense layout grids, dashboard charts, filters, and activity metrics.
5. **AI Assistant (`@/lib/ai/`)**: LLM interface for query translation and summaries (Deferred MVP Scope).

---

## 5. Project Directory Structure

```
├── .env.example                # Documented required environment secrets
├── AGENTS.md                   # Persistent system instructions & principles
├── PRD.md                      # Product Requirements Document
├── TASK.md                     # Engineering Epic task tracker
├── DECISIONS.md                # Architecture Decision Records (ADRs)
├── ROADMAP.md                  # Milestone-based roadmap
├── CHANGELOG.md                # SemVer release ledger
├── firebase-blueprint.json     # Firestore entity and collection declarations
├── firestore.rules             # Zero-Trust Firestore security rules
├── next.config.ts              # Next.js bundler and optimization settings
├── postcss.config.mjs          # PostCSS configuration for Tailwind CSS
├── tsconfig.json               # Strictly typed compiler configuration
├── package.json                # Project dependencies and script runner
│
├── app/                        # Next.js App Router Root
│   ├── globals.css             # Tailwind v4 configuration and global styling
│   ├── layout.tsx              # Base viewport and Inter font configuration
│   └── page.tsx                # Master dashboard landing view
│
├── components/                 # Presentation components
│   └── ui/                     # Isolated custom UI kit components
│
├── hooks/                      # Custom hooks
│   └── use-mobile.ts           # Screen viewport breakpoint listener
│
├── lib/                        # Cross-domain logic
│   ├── firebase.ts             # Firebase app, Firestore, and Auth bootstrap
│   ├── firebase-error.ts       # Firestore error handlers and diagnostic wrappers
│   ├── utils.ts                # Unit converters (pace, elevation, distance)
│   ├── analysis/               # Single-activity formula execution
│   │   └── formulas.ts         # Math library (RSS, IF, EF, decoupling)
│   └── performance/            # Multi-activity trends execution
│       └── algorithms.ts       # Decay math (CTL/ATL/TSB exponential curves)
│
├── providers/                  # Application contexts
│   └── firebase-provider.tsx   # Auth state and provider wrapper
│
└── types/                      # Canonical static types
    ├── data-platform.ts        # Sync connections, OAuth schemas, running sports
    ├── athlete.ts              # Physiological profiles, zones (pace/HR)
    ├── analysis.ts             # Performance parameters per workout
    └── performance.ts          # Fitness trends and historic record curves
```

---

## 6. Development Workflow

### 1. Initialization
Dependencies are managed via `npm`. Ensure packages are fully synchronized before building:
```bash
npm install
```

### 2. Development Execution
Start the development server with Hot Module Replacement controls active:
```bash
npm run dev
```
The application runs behind a reverse proxy bound exclusively to port `3000`. Do not modify the dev port.

### 3. Static Verification
Validate syntactical compliance, type coverage, and structural layout issues:
```bash
# Verify ESLint constraints
npm run lint

# Compile and verify bundle readiness
npm run build
```

### 4. Zero-Trust Rules Maintenance
All security rules exist in `/firestore.rules`. Ensure any schema addition in `firebase-blueprint.json` maps directly to verified access rules prior to production release.
