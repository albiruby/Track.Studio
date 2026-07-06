# Track.Studio — Universal Ingestion Engine (Module Specification)

The **Universal Ingestion Engine** is the foundational core of the Track.Studio performance platform. It is engineered to securely synchronize, ingest, and persist physical workout data from external data sources (Strava, Intervals.icu) under strict production reliability guarantees.

---

## 1. Architectural Philosophy

### Immutable Raw Data Policy
Raw API responses are treated as the single, immutable source of truth. 
- **No Mutation**: Payloads are stored exactly as received.
- **No Overwrite**: Multiple fetch cycles preserve every page separately.
- **Traceability**: Future analytic passes can rebuild the state cleanly from raw files.

### Decoupled Processing Pipeline
The ingestion queue runs independently of presentation metrics. Mathematical modeling and training logs are strictly decoupled from the core ingestion sequence.

---

## 2. Ingestion Pipeline Stages

1. **Authentication Handshake Verification**: Ensure active OAuth access token or static API Key exists.
2. **Channel Health & Validation**: Pre-flight call to confirm the third-party endpoint is online.
3. **Rate Limit Threshold Audit**: Proactive check on local quotas to prevent hitting platform boundaries.
4. **Targeted Pagination Windowing**: Establish cursors, page indexes, or date offsets.
5. **Raw API Streams Fetching**: Perform safe HTTP requests carrying credentials.
6. **Integrity Validation**: Ensure JSON format and critical attributes match strict interface schemas.
7. **Deduplication Hashing**: Compute a deterministic semantic hash of payloads.
8. **Raw Storage Persistence**: Commit unmutated payload array JSON to the Firestore storage layer.
9. **History Logging**: Append metadata state records.
10. **Audit Log Completion**: Update detailed sync logs and execution timelines.

---

## 3. Rate Limit Management

Track.Studio implements a proactive **Rate Limit Engine** protecting both application keys and user access:
- **Rate Limit Detection**: Inspects standard HTTP `429` statuses along with vendor specific limits (`X-Read-RateLimit-Limit`, `X-Read-RateLimit-Usage`).
- **Proactive Cooldown**: Automatically pauses ingestion if vendor utilization crosses `98%` of allowance.
- **Exponential Backoff with Full Jitter**:
  $$\text{Delay} = \min(\text{MaxBackoff}, 2^{\text{retryCount}}) \times \text{RandomJitter}$$
  Prevents thundering herd problems on API services.
- **Retry Safety**: Jobs transition to a `waiting` state, letting the server sleep before retrying.

---

## 4. Idempotency & Deduplication

- **Hash Mapping**: Every received page payload has its sorted keys serialized and hashed using a deterministic FNV-1a custom algorithm.
- **Duplicate Prevention**: If a hash exists in the database, persistence is bypassed. Marked as skipped.
- **Activity Identity Checks**: External activity IDs are audited before committing data to downstream schemas.

---

## 5. Timing & Audit Specifications

Every sync run appends an **Audit Log Record**:
- **Execution Timing**: Precise execution duration in milliseconds.
- **Metric Verification**: Detailed counts of processed items, stored records, skipped duplicates, and failed rows.
- **Detailed Error Logging**: Centralized error codes and suggested self-resolving steps.
- **Cancellation Safety**: Ingestion cycles check a Firestore-backed cancellation requested flag before every single pagination call, immediately transitioning the job state to `cancelled` and halting thread execution gracefully.
