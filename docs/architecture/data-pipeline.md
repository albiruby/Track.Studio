# Track.Studio — Ingestion Data Pipeline Architecture

This document defines the architectural data pipeline flow, secure storage structure, and system boundaries of the Ingestion Engine.

---

## 1. Pipeline Flow Diagram

```
[ External Vendor API ]
          │ (OAuth / Basic Auth)
          ▼
┌────────────────────────────────┐
│   Authentication Validation    │◄─── Reads secure sub-collection
└───────────────┬────────────────┘     "connections_secure"
                ▼
┌────────────────────────────────┐
│   Connection pre-flight Check  │
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│   Rate Limit Threshold Audit   │◄─── Prevents 429 & proactive limits
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│       Pagination Ingest        │◄─── Cursor / Page loop
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│   JSON schema Validation       │◄─── Integrity and completeness check
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│   Deduplication Hashing        │◄─── FNV-1a Hash matching
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│   Immutable Raw Persistence    │◄─── Writes unmutated JSON payload to
└───────────────┬────────────────┘     "rawData" sub-collection
                ▼
┌────────────────────────────────┐
│       Detailed Auditing        │◄─── Commits "auditLogs" record
└────────────────────────────────┘
```

---

## 2. Firestore Collection Scheme

All client-authored inputs, sync logs, raw data, and security profiles are nested cleanly under a user-scoped root structure to satisfy strict multi-tenant isolation constraints:

```
users/
└── {userId}/
    ├── connections/
    │   └── {providerId}           <-- Redacted public connection state
    ├── connections_secure/
    │   └── {providerId}           <-- Secure server-only OAuth tokens & API keys
    ├── syncJobs/
    │   └── {jobId}                <-- Live real-time progress details
    ├── rawData/
    │   └── {rawRecordId}          <-- Immutable raw response array payloads
    ├── ingestionErrors/
    │   └── {errorId}              <-- Central error log registry
    └── auditLogs/
        └── {auditId}              <-- Ingestion audit timing records
```

---

## 3. Privacy & Security Invariants

- **Token Protection**: Access tokens, refresh tokens, and raw vendor credentials are kept in the `connections_secure` collection. They are NEVER retrieved in client components, printed to standard out console logging, or stored in standard audit logs.
- **Redaction**: All request/response objects stored in public logs have their authorization parameters stripped or hashed before write operations.
- **Deterministic Derivation**: Raw data must never be computed directly. To enforce raw data integrity, calculated metrics or normalized physiological events are kept entirely separate.
