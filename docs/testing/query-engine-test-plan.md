# Analytics Query Engine - Test Plan

This document details the test scenarios, mock structures, and validation procedures to verify the correctness, performance, and robustness of the `AnalyticsQueryEngine`.

## Test Scenarios

### 1. Unified Integration Test
- **Objective**: Verify that `AnalyticsQueryEngine` correctly constructs complex models (`HomeDashboardViewModel`, `PerformanceOverviewViewModel`, `ActivityDetailViewModel`) by querying mock repositories without hitting Firebase Firestore.
- **Verification**: Ensure nested summaries (weekly summaries, monthly summaries, alerts) are computed correctly, zero calculations are bypassed, and all traceability fields are populated.

### 2. Cache Validation Test
- **Objective**: Ensure that `AnalyticsCache` does not re-query mock repositories upon hitting cached datasets.
- **Verification**: Fetch `HomeDashboardViewModel` twice. Verify that cache policy respects TTL and that changing values are only reflected when cache is invalidated.

### 3. Filter Engine Test
- **Objective**: Verify keyword, distance, duration, speed, pace, heart rate, power, cadence, and temperature filters.
- **Verification**: Assert that only elements matching exact criteria boundaries are returned.

### 4. Sort Engine Test
- **Objective**: Validate multiple sorting rules (`date`, `distance`, `duration`, `speed`, `pace`, `heartRate`, `power`, `cadence`, `elevation`, `alphabetical`) across ascending and descending orders.
- **Verification**: Assert the chronological/numerical order of output results.

### 5. Pagination Engine Test
- **Objective**: Verify universal offset and limit pagination and cursor-based infinite scroll.
- **Verification**: Assert correct page slicing, next cursors, and page limits.
