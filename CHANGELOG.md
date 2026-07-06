# Changelog

All notable changes to the Track.Studio project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-07-05

### Added
- **Core Architecture Framework**: Initialized Next.js 15+ (App Router) combined with strict TypeScript path mapping.
- **Pure Metric Engine**:
  - Implemented mathematical formulas for Running Stress Score (RSS), Intensity Factor (IF), Efficiency Factor (EF), and Aerobic Decoupling in `/lib/analysis/formulas.ts`.
  - Implemented Chronic Training Load (CTL), Acute Training Load (ATL), and Training Stress Balance (TSB) exponential decay curves in `/lib/performance/algorithms.ts`.
- **Infrastructure Integrations**:
  - Bootstrapped `/lib/firebase.ts` client initialization.
  - Formulated schema entities in `/firebase-blueprint.json` covering profile, activities, and metrics.
  - Implemented `/firestore.rules` enforcing zero-trust document boundaries and structural payload type checking.
  - Implemented `/providers/firebase-provider.tsx` Google Authentication state context.
- **Presentation Layer**:
  - Built atomic landing dashboard shell in `/app/page.tsx` displaying system architecture mapping, sync indicators, and foundation manifest.
  - Configured high-contrast theme via Tailwind CSS v4 in `/app/globals.css`.
- **System Directives**: Created `/AGENTS.md` outlining project scope limits, data invariants, and coding standards.
- **Engineering Foundation Documentation**:
  - Authored detailed `README.md` and `PRD.md` delineating exact feature bounds.
  - Authored `TASK.md` detailing functional Epics and task backlogs.
  - Authored `DECISIONS.md` listing primary Architecture Decision Records (ADRs).
  - Authored `ROADMAP.md` setting milestone paths from foundation to launch.
