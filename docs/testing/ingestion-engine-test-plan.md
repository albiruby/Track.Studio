# Track.Studio — Ingestion Engine Verification & Test Plan

This document maps the validation steps, test cases, and quality checks implemented for the Ingestion Engine module.

---

## 1. Test Philosophy
The test strategy validates the pipeline's handling of diverse API behaviors, rate restrictions, pagination, corrupted structures, and user interruptions without executing business logic calculations.

---

## 2. Ingestion Pipeline Verification Map

### Ingestion Validation Suite
- **Path**: `lib/data-platform/ingestion/validator.ts`
- **Objective**: Ensure incoming raw payloads strictly comply with expected API schemas.
- **Test Scenarios**:
  - `VALID_STRAVA_ACTIVITIES`: Confirm valid JSON array carrying `id`, `start_date`, and type passes validation.
  - `CORRUPTED_JSON`: Confirm malformed or corrupted JSON strings reject early.
  - `MISSING_ID_KEYS`: Confirm items lacking unique external Identifiers raise blockages.

### Deduplication Test Specification
- **Path**: `lib/data-platform/ingestion/deduplicator.ts`
- **Objective**: Confirm zero payload duplication and strict idempotency.
- **Test Scenarios**:
  - `IDENTICAL_PAYLOAD_HASH`: Verify that two payloads with the exact same data produce identical keys-sorted hashes.
  - `SKIPPED_PERSISTENCE`: Confirm that previously written payload hashes skip database writes in sequential loops.

### Pagination Strategy Verification
- **Path**: `lib/data-platform/ingestion/paginator.ts`
- **Objective**: Ensure correct termination of pagination streams.
- **Test Scenarios**:
  - `PARTIAL_PAGE_TERMINATION`: Verify that a response containing fewer items than `pageSize` halts further calls.
  - `CURSOR_LINK_PARSING`: Verify next cursors parse accurately from Link headers.

### Rate Limit & Cooldown Protection
- **Path**: `lib/data-platform/ingestion/rate-limiter.ts`
- **Objective**: Prevent platform throttling and respect server backoff instructions.
- **Test Scenarios**:
  - `STATUS_429_RETRY_AFTER`: Inspect and parse `Retry-After` HTTP headers to calculate accurate delays.
  - `PROACTIVE_98_PERCENT_HOLD`: Trigger custom proactive cooldowns when rate limits approach maximum allowed threshold.
  - `EXPONENTIAL_JITTER`: Verify random jitter limits parallel requests from stacking.

---

## 3. Failure & Interruption Scenarios

### Ingestion Interruption (User-Triggered)
- **Action**: User clicks "Halt Sync" in the Calibration Console.
- **Expected Outcome**:
  1. UI triggers API `PATCH` request.
  2. SyncJob document state changes to `cancellationState: 'requested'`.
  3. Server ingestion thread reads this state prior to the next page fetch, stops fetching, commits written pages, and completes with status `cancelled`.
  4. Final audit log logs duration and downloaded records.

### Token Expiration Recovery
- **Action**: Strava OAuth access token is expired on fetch.
- **Expected Outcome**:
  1. Universal Sync Manager detects expired credentials metadata.
  2. Triggers token refresh with client secrets.
  3. Writes unredacted refreshed credentials to `connections_secure`.
  4. Updates redacted metadata in Connection.
  5. Resumes API calls.
