# Track.Studio — Coding Standards & System Principles

This file defines the strict architectural directives and code quality standards for Track.Studio. All future development and agent instructions must adhere to these policies.

---

## 1. PROJECT SCOPE & PURPOSE
Track.Studio is a modern running performance analysis platform. Its focus is solely on **data acquisition, data processing, data analysis, and performance evaluation**.

- **NOT a social platform** (no feeds, likes, followers, or social comments).
- **NOT a workout planner** (no calendar scheduling, training plans, or workout builders).
- **NOT an AI coach** (no automated training recommendations or generated schedules).

---

## 2. CORE PHILOSOPHY & DATA INVARIANTS
- **Real Data Only**: No fake, placeholder, or fabricated training metrics. If data is absent, present a clear connected status empty state.
- **Preservation of Raw Data**: Keep the raw payloads from data sources (Strava, Intervals.icu) in their exact, pristine form.
- **Deterministic & Explainable**: Every calculated metric (e.g., RSS, Intensity Factor, CTL, ATL, TSB) must be derived using documented, industry-standard formulas. No hidden heuristics or black-box math.

---

## 3. ARTIFICIAL INTELLIGENCE (AI) POLICY
- AI is an optional interpreter plugin, not a core state manager.
- AI must **NEVER** calculate performance metrics, modify activity database records, or fabricate running values.
- AI is restricted to **natural language explanations, summaries, translations, and interactive query interpretations**.

---

## 4. SYSTEM ARCHITECTURE & DOMAINS
The platform is organized into five strict structural domains:

1. **Data Platform (`@/lib/data-platform/`)**: Connection credentials, token exchange, activity sync queue, schema verification, and canonical normalization.
2. **Analysis Engine (`@/lib/analysis/`)**: Mathematical execution of single-activity metrics (Pacing Variability, Decoupling, Intensity, RSS).
3. **Performance Engine (`@/lib/performance/`)**: Multi-workout historical trend generation (CTL, ATL, TSB calculations, Peak Pace curve).
4. **Presentation Layer (`@/components/` & `@/app/`)**: High-contrast, highly readable dashboard charts, filters, and activity metrics.
5. **AI Assistant**: Future plugin (Deferred).

---

## 5. REUSABLE INFRASTRUCTURES & DEFAULTS
- **Authentication**: Firebase Authentication (Google OAuth).
- **Database**: Cloud Firestore.
- **Styling**: Tailwind CSS (v4) with high-contrast Slate design theme.
- **Charts**: Recharts.
- **Icons**: Lucide React.
