/**
 * Standalone Test Suite for the Analytics Query Engine, View Models, and Cache
 */

import { CanonicalAthlete, CanonicalActivity, CanonicalGear, CanonicalRoute, CanonicalSplit, CanonicalLap, CanonicalStream } from '@/lib/data-platform/canonical/types';
import { ComputedMetric } from '@/lib/metrics/types';
import { Decision } from '@/lib/decision-engine/types';
import { AnalyticsQueryEngine, QueryContext } from '../query-engine';
import { AnalyticsCache } from '../cache';
import { ViewRegistry } from '../registry';

// Assert helpers
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function assertEquals<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`Assertion Failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

// -------------------------------------------------------------
// Mock Data Generation
// -------------------------------------------------------------

const mockAthlete: CanonicalAthlete = {
  id: 'athlete_test_123',
  firstName: 'John',
  lastName: 'Runner',
  profileUrl: null,
  gender: 'M',
  weightKg: 70,
  restingHeartRateBpm: 48,
  maxHeartRateBpm: 188,
  ftpWatts: 260,
  vO2Max: 55.4,
  timezone: 'America/New_York',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  sourceMetadata: {
    providerId: 'strava',
    providerObjectId: 'ext_athlete_123',
    rawDocumentId: 'doc_athlete_123',
    syncJobId: 'sync_123',
    apiEndpoint: 'https://api.strava.com',
    payloadHash: 'hash',
    providerApiVersion: 'v3',
    transformationVersion: '1.0.0',
    importedAt: '2026-01-01T00:00:00Z'
  },
  metadata: {
    schemaVersion: '1.0.0',
    importedAt: '2026-01-01T00:00:00Z',
    transformationVersion: '1.0.0'
  }
};

const mockActivities: CanonicalActivity[] = [
  {
    id: 'activity_001',
    externalProviderId: 'strava',
    providerObjectId: 'ext_act_001',
    athleteId: 'athlete_test_123',
    activityName: 'Morning Tempo Run',
    sportType: 'running',
    startDate: '2026-07-06T10:00:00Z',
    timezone: 'America/New_York',
    elapsedTimeSec: 3800,
    movingTimeSec: 3600,
    distanceMeters: 10000, // 10k
    averagePaceMinPerKm: 6.0, // 6:00/km
    averageSpeedMps: 2.78,
    maximumSpeedMps: 4.1,
    elevationGainMeters: 120,
    elevationLossMeters: 120,
    averageHeartRateBpm: 162,
    maxHeartRateBpm: 178,
    averageCadenceRpm: 180,
    maxCadenceRpm: 188,
    averagePowerWatts: 230,
    maxPowerWatts: 310,
    calories: 780,
    device: { name: 'Garmin Forerunner 955', serialNumber: 'sn_001', manufacturer: 'Garmin' },
    shoesId: 'shoes_pegasus_39',
    gpsPolyline: 'polyline_data',
    visibility: 'public',
    privateFlag: false,
    manualFlag: false,
    commuteFlag: false,
    trainerFlag: false,
    kilojoules: 710,
    weather: {
      temperatureC: 22.0,
      humidityPercent: 50,
      windSpeedMps: 3.2,
      windDirectionDeg: 180,
      summary: 'Partly Cloudy',
      precipProbabilityPercent: 10
    },
    location: { country: 'USA', state: 'NY', city: 'Brooklyn', startLatLng: [40.7, -73.9], endLatLng: [40.72, -73.92] },
    elevation: { gainMeters: 120, lossMeters: 120, maxAltitudeMeters: 55, minAltitudeMeters: 5 },
    achievements: [],
    bestEfforts: [
      { name: '5k', distanceMeters: 5000, elapsedTimeSec: 1080, movingTimeSec: 1080, startIndex: 0, endIndex: 500 }
    ],
    createdAt: '2026-07-06T11:00:00Z',
    updatedAt: '2026-07-06T11:00:00Z',
    sourceMetadata: {
      providerId: 'strava',
      providerObjectId: 'ext_act_001',
      rawDocumentId: 'doc_act_001',
      syncJobId: 'sync_123',
      apiEndpoint: 'https://api.strava.com',
      payloadHash: 'hash',
      providerApiVersion: 'v3',
      transformationVersion: '1.0.0',
      importedAt: '2026-07-06T11:00:00Z'
    },
    metadata: {
      schemaVersion: '1.0.0',
      importedAt: '2026-07-06T11:00:00Z',
      transformationVersion: '1.0.0'
    }
  },
  {
    id: 'activity_002',
    externalProviderId: 'strava',
    providerObjectId: 'ext_act_002',
    athleteId: 'athlete_test_123',
    activityName: 'Recovery Jog',
    sportType: 'running',
    startDate: '2026-07-05T08:00:00Z',
    timezone: 'America/New_York',
    elapsedTimeSec: 2500,
    movingTimeSec: 2400,
    distanceMeters: 5000, // 5k
    averagePaceMinPerKm: 8.0, // 8:00/km
    averageSpeedMps: 2.08,
    maximumSpeedMps: 2.5,
    elevationGainMeters: 20,
    elevationLossMeters: 20,
    averageHeartRateBpm: 130,
    maxHeartRateBpm: 140,
    averageCadenceRpm: 172,
    maxCadenceRpm: 176,
    averagePowerWatts: 170,
    maxPowerWatts: 190,
    calories: 350,
    device: { name: 'Garmin Forerunner 955', serialNumber: 'sn_001', manufacturer: 'Garmin' },
    shoesId: 'shoes_pegasus_39',
    gpsPolyline: 'polyline_data_2',
    visibility: 'public',
    privateFlag: false,
    manualFlag: false,
    commuteFlag: false,
    trainerFlag: false,
    kilojoules: 320,
    weather: {
      temperatureC: 18.0,
      humidityPercent: 60,
      windSpeedMps: 1.5,
      windDirectionDeg: 90,
      summary: 'Clear',
      precipProbabilityPercent: 0
    },
    location: { country: 'USA', state: 'NY', city: 'Brooklyn', startLatLng: [40.7, -73.9], endLatLng: [40.72, -73.92] },
    elevation: { gainMeters: 20, lossMeters: 20, maxAltitudeMeters: 30, minAltitudeMeters: 10 },
    achievements: [],
    bestEfforts: [],
    createdAt: '2026-07-05T09:00:00Z',
    updatedAt: '2026-07-05T09:00:00Z',
    sourceMetadata: {
      providerId: 'strava',
      providerObjectId: 'ext_act_002',
      rawDocumentId: 'doc_act_002',
      syncJobId: 'sync_123',
      apiEndpoint: 'https://api.strava.com',
      payloadHash: 'hash',
      providerApiVersion: 'v3',
      transformationVersion: '1.0.0',
      importedAt: '2026-07-05T09:00:00Z'
    },
    metadata: {
      schemaVersion: '1.0.0',
      importedAt: '2026-07-05T09:00:00Z',
      transformationVersion: '1.0.0'
    }
  }
];

const mockMetrics: ComputedMetric[] = [
  {
    metricId: 'rss',
    athleteId: 'athlete_test_123',
    activityId: 'activity_001',
    value: 85.0,
    timestamp: '2026-07-06T10:00:00Z',
    units: 'points',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    inputReferences: ['activity_001']
  },
  {
    metricId: 'rss',
    athleteId: 'athlete_test_123',
    activityId: 'activity_002',
    value: 30.0,
    timestamp: '2026-07-05T08:00:00Z',
    units: 'points',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    inputReferences: ['activity_002']
  },
  {
    metricId: 'ctl',
    athleteId: 'athlete_test_123',
    activityId: 'activity_001',
    value: 65.4,
    timestamp: '2026-07-06T10:00:00Z',
    units: 'points',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    inputReferences: []
  },
  {
    metricId: 'atl',
    athleteId: 'athlete_test_123',
    activityId: 'activity_001',
    value: 82.1,
    timestamp: '2026-07-06T10:00:00Z',
    units: 'points',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    inputReferences: []
  },
  {
    metricId: 'tsb',
    athleteId: 'athlete_test_123',
    activityId: 'activity_001',
    value: -16.7,
    timestamp: '2026-07-06T10:00:00Z',
    units: 'points',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    inputReferences: []
  },
  {
    metricId: 'hr_drift',
    athleteId: 'athlete_test_123',
    activityId: 'activity_001',
    value: 4.8,
    timestamp: '2026-07-06T10:00:00Z',
    units: '%',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    inputReferences: ['activity_001']
  },
  {
    metricId: 'integrity_score',
    athleteId: 'athlete_test_123',
    activityId: 'activity_001',
    value: 99.5,
    timestamp: '2026-07-06T10:00:00Z',
    units: '%',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    inputReferences: ['activity_001']
  }
];

const mockDecisions: Decision[] = [
  {
    decisionId: 'decision_001',
    athleteId: 'athlete_test_123',
    activityId: 'activity_001',
    category: 'running_efficiency',
    name: 'Cardiovascular Drift Safe',
    status: 'Aerobically Coupled',
    score: 95.2,
    severity: 'info',
    explanationCode: 'HR_DRIFT_NORMAL',
    supportingRules: ['rule_aerobic_decoupling'],
    scientificReferences: ['Jeukendrup et al., 2018'],
    generatedTimestamp: '2026-07-06T11:00:00Z',
    confidence: 1.0,
    supportingMetrics: {},
    thresholdVersion: '1.0.0',
    ruleVersion: '1.0.0'
  },
  {
    decisionId: 'decision_002',
    athleteId: 'athlete_test_123',
    activityId: 'activity_001',
    category: 'training_load',
    name: 'Acute Fatigue Stress Warning',
    status: 'High Training Fatigue',
    score: -16.7,
    severity: 'medium',
    explanationCode: 'TSB_ACCUMULATING_FATIGUE',
    supportingRules: ['rule_recovery_tsb'],
    scientificReferences: ['Bannister Cardio Model, 1975'],
    generatedTimestamp: '2026-07-06T11:00:00Z',
    confidence: 1.0,
    supportingMetrics: {},
    thresholdVersion: '1.0.0',
    ruleVersion: '1.0.0'
  }
];

const mockGear: CanonicalGear[] = [
  {
    id: 'shoes_pegasus_39',
    athleteId: 'athlete_test_123',
    name: 'Nike Pegasus 39',
    brandName: 'Nike',
    modelName: 'Pegasus 39',
    distanceMeters: 450000,
    isPrimary: true,
    description: 'Daily trainer shoe',
    retired: false,
    type: 'shoes',
    sourceMetadata: {
      providerId: 'strava',
      providerObjectId: 'ext_shoes_1',
      rawDocumentId: 'doc_shoes',
      syncJobId: 'sync_123',
      apiEndpoint: 'https://api.strava.com',
      payloadHash: 'hash',
      providerApiVersion: 'v3',
      transformationVersion: '1.0.0',
      importedAt: '2026-01-01T00:00:00Z'
    },
    metadata: {
      schemaVersion: '1.0.0',
      importedAt: '2026-01-01T00:00:00Z',
      transformationVersion: '1.0.0'
    }
  }
];

const mockContext: QueryContext = {
  athlete: mockAthlete,
  activities: mockActivities,
  metrics: mockMetrics,
  decisions: mockDecisions,
  gear: mockGear,
  connections: [{ providerId: 'strava' }],
  syncAttempts: [{ id: 'sa_001', providerId: 'strava', success: true, timestamp: '2026-07-06T11:00:00Z' }]
};

// -------------------------------------------------------------
// Testing Routines
// -------------------------------------------------------------

async function runTests() {
  console.log('====================================================');
  console.log('TRACK.STUDIO — PHASE 9 ANALYTICS QUERY ENGINE TESTS');
  console.log('====================================================');

  const engine = new AnalyticsQueryEngine(mockContext);

  // 1. Home Dashboard View Model test
  console.log('Scenario 1: Build Home Dashboard ViewModel...');
  const dashboard = await engine.queryHomeDashboard('athlete_test_123', 'none');
  assertEquals(dashboard.athlete.firstName, 'John', 'Athlete name mismatch');
  assertEquals(dashboard.recentActivities.length, 2, 'Recent activities count mismatch');
  assertEquals(dashboard.currentCTL, 65.4, 'CTL mismatch');
  assertEquals(dashboard.currentATL, 82.1, 'ATL mismatch');
  assertEquals(dashboard.currentTSB, -16.7, 'TSB mismatch');
  assert(dashboard.latestAlerts.length > 0, 'Should return load alerts');
  assertEquals(dashboard.latestAlerts[0].severity, 'medium', 'Alert severity mismatch');
  assert(dashboard.traceability.canonicalIds.includes('athlete_test_123'), 'Missing athlete ID in traceability');
  assert(dashboard.traceability.metricIds.includes('ctl'), 'Missing metric ID in traceability');
  console.log('✓ Scenario 1 Passed Successfully.');

  // 2. Performance Overview View Model test
  console.log('\nScenario 2: Build Performance Overview ViewModel...');
  const performance = await engine.queryPerformanceOverview('athlete_test_123', 'none');
  assertEquals(performance.fitness.currentCTL, 65.4, 'Fitness CTL mismatch');
  assertEquals(performance.fatigue.currentATL, 82.1, 'Fatigue ATL mismatch');
  assertEquals(performance.form.currentTSB, -16.7, 'Form TSB mismatch');
  assertEquals(performance.form.status, 'Fatigued', 'Form state categorization mismatch');
  assert(performance.traceability.metricIds.includes('atl'), 'Traceability metric ID missing');
  console.log('✓ Scenario 2 Passed Successfully.');

  // 3. Cache Engine Validation
  console.log('\nScenario 3: Validate Caching Policies...');
  const cacheKey = AnalyticsCache.makeKey('home_dashboard', 'athlete_test_123');
  AnalyticsCache.set(cacheKey, { test: 'cached_view' }, 'memory');
  const cachedVal = AnalyticsCache.get<any>(cacheKey, 'memory');
  assertEquals(cachedVal?.test, 'cached_view', 'Cache value retrieval failed');

  // Test invalidation
  AnalyticsCache.invalidate('athlete_test_123');
  const valAfterInvalidation = AnalyticsCache.get<any>(cacheKey, 'memory');
  assertEquals(valAfterInvalidation, null, 'Cache invalidation did not clear entries');
  console.log('✓ Scenario 3 Passed Successfully.');

  // 4. Universal Search, Filter & Sort Validation
  console.log('\nScenario 4: Validate Sorting, Filtering & Text Search Engine...');
  
  // Keyword Search
  const search1 = await engine.querySearchResult('athlete_test_123', 'Tempo');
  assertEquals(search1.activities.length, 1, 'Keyword search for Tempo failed');
  assertEquals(search1.activities[0].activityName, 'Morning Tempo Run', 'Keyword search did not isolate Tempo run');

  // Location search
  const search2 = await engine.querySearchResult('athlete_test_123', 'Brooklyn');
  assertEquals(search2.activities.length, 2, 'Search by location failed');

  // Filter verification (e.g., minimum distance filter)
  const filtersMinDist = { minDistance: 8000 };
  const search3 = await engine.querySearchResult('athlete_test_123', '', filtersMinDist);
  assertEquals(search3.activities.length, 1, 'Distance filter failed to isolate >8k activity');
  assertEquals(search3.activities[0].activityName, 'Morning Tempo Run', 'Distance filter isolated incorrect activity');

  // Sorting verification (distance ascending vs descending)
  const sortAsc = await engine.querySearchResult('athlete_test_123', '', undefined, { field: 'distance', order: 'asc' });
  assertEquals(sortAsc.activities[0].activityId, 'activity_002', 'Sort ascending failed (expected recovery run first)');

  const sortDesc = await engine.querySearchResult('athlete_test_123', '', undefined, { field: 'distance', order: 'desc' });
  assertEquals(sortDesc.activities[0].activityId, 'activity_001', 'Sort descending failed (expected tempo run first)');
  console.log('✓ Scenario 4 Passed Successfully.');

  // 5. Registry Integrity
  console.log('\nScenario 5: Validate View Registry Integrity...');
  const entry = ViewRegistry.get('home_dashboard');
  assert(entry !== undefined, 'Registry should define home_dashboard metadata');
  if (entry) {
    assertEquals(entry.viewId, 'home_dashboard', 'View ID mismatch');
    assertEquals(entry.cachePolicy, 'memory', 'Cache policy mismatch');
    assert(entry.dependencies.includes('athlete'), 'Athlete dependency missing from home_dashboard metadata');
  }
  console.log('✓ Scenario 5 Passed Successfully.');

  console.log('\n====================================================');
  console.log('  ALL ANALYTICS QUERY ENGINE TEST SCENARIOS PASSED!  ');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
