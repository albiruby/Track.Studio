# Track.Studio — Architecture Decision Records (ADRs)

This document chronicles the fundamental architectural decisions made during the design and engineering lifecycle of the Track.Studio platform.

---

## ADR 1: Next.js (App Router) as the Core Framework

### Context & Problem
We require a modern web framework that supports seamless developer experience, static optimizations, secure server-side execution of third-party API keys, and performant client interfaces.

### Decision
Utilize **Next.js 15+ with App Router** as our single-stack core framework.

### Status
`Accepted`

### Consequences & Reasons
- **Pros**:
  - Leverages React Server Components (RSC) to minimize initial page load payload size.
  - Server-side routing under `app/api/` proxies sensitive credentials without exposing client keys.
  - Easy static and standalone Docker builds optimal for scalable Cloud Run hosting.
- **Cons**:
  - Requires strict division between Server Components and Client Components using `'use client'` directives.
  - Dynamic route processing may require cold start considerations, managed via static compilation where possible.

---

## ADR 2: Cloud Firestore for Primary Data Persistence

### Context & Problem
Athletes input sensitive physiological data, sync high-frequency GPS stream coordinates, and expect real-time dashboard updates across devices. We need a flexible, highly secure NoSQL database that requires minimal operations overhead.

### Decision
Adopt **Google Cloud Firestore** as our primary database.

### Status
`Accepted`

### Consequences & Reasons
- **Pros**:
  - Real-time event listeners stream activity sync status and loading transitions seamlessly to the UI.
  - Granular security rules enforce a zero-trust architecture directly at the database level, preventing cross-user data exposure.
  - Flexible document schemas support evolving telemetry metadata from third-party streams without running expensive migrations.
- **Cons**:
  - Relational joins must be handled via client-side grouping or duplicated metadata structures.
  - NoSQL structures require strict schema verification libraries (such as schema validation in security rules) to prevent garbage writes.

---

## ADR 3: Firebase Authentication with Google OAuth

### Context & Problem
We require a frictionless, secure, and industry-standard sign-in and account management system that protects private training data.

### Decision
Standardize on **Firebase Authentication using Google OAuth** as the exclusive identity provider.

### Status
`Accepted`

### Consequences & Reasons
- **Pros**:
  - Native integration with Firestore security rules (`request.auth.uid` binds directly to records).
  - Out-of-the-box token generation, session lifecycle tracking, and encrypted credential handling.
  - Drastically lowers friction for athlete onboarding.
- **Cons**:
  - Locks user identity architecture to Firebase services (acceptable tradeoff given our tech stack).

---

## ADR 4: Separation of Metric Engine and Presentation Layers

### Context & Problem
Mathematical models for training stress and decay (RSS, CTL, ATL, TSB) form the core intellectual property of the platform. Coupling these formulas directly inside React views or charts introduces serious testing, porting, and maintenance debt.

### Decision
Enforce a strict separation of the mathematical **Metric Engine** (`/lib/analysis/` and `/lib/performance/`) from the **Presentation Layer** (`/app/` and `/components/`).

### Status
`Accepted`

### Consequences & Reasons
- **Pros**:
  - Decoupled modules consist entirely of pure, deterministic functions, making them easily testable under Jest or Vitest without mock rendering overhead.
  - Calculation performance can be optimized in isolation (e.g., swapping standard loops with WebAssembly if stream size scales up).
- **Cons**:
  - Requires explicit serialization structures to translate UI states into metric parameters.

---

## ADR 5: Deterministic Artificial Intelligence (AI) Policy

### Context & Problem
Generative AI and Large Language Models are highly capable of natural language processing but prone to hallucinations when calculating mathematical equations, creating database entities, or fabricating physical telemetry metrics.

### Decision
Limit AI strictly to **narrative generation, search query translation, and semantic trend explanation**. AI is strictly forbidden from editing database activities, fabricating training stress numbers, or generating workouts.

### Status
`Accepted`

### Consequences & Reasons
- **Pros**:
  - Guarantees the absolute integrity of physical athletic metrics.
  - Eliminates "AI slop" or randomized analytics, maintaining elite levels of scientific accuracy.
  - Ensures the user is always presented with explainable, reproducible equations.
- **Cons**:
  - Restricts conversational assistance to interpretive roles (e.g., "explain why my CTL spiked last week" instead of "recalculate my CTL for last week").

---

## ADR 6: Zero-Trust Firestore Security Policy

### Context & Problem
An athlete's coordinate routes, physiological zones, and training volume are sensitive personal data. We must guarantee absolute isolation of user records.

### Decision
Deploy a strictly locked-down `/firestore.rules` where read and write actions default to `allow read, write: if false` unless explicitly authenticated and ownership is mathematically proven.

### Status
`Accepted`

### Consequences & Reasons
- **Pros**:
  - Complete protection against document ID spoofing and resource leakage.
  - Schema validations are enforced directly at the transactional boundary, catching malformed sync payloads prior to persistence.
- **Cons**:
  - Enhancing database schemas requires parallel updates to the security rules syntax.
  - Mocking test states locally requires running the Firebase Emulator Suite.
