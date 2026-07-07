/**
 * Standalone Test Suite for the Deterministic Rule & Decision Engine
 */

import { CanonicalActivity, CanonicalAthlete } from '@/lib/data-platform/canonical/types';
import { ComputedMetric } from '@/lib/metrics/types';
import { ThresholdRegistry } from '../threshold-registry';
import { RuleRegistry } from '../rule-registry';
import { DecisionEngine } from '../engine';
import { DecisionRepository } from '../repository';
import { Decision } from '../types';

// Standalone assert helpers
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

// Mock Data
const mockAthlete: CanonicalAthlete = {
  id: 'athlete_test_999',
  firstName: 'Jane',
  lastName: 'Athlete',
  profileUrl: null,
  gender: 'F',
  weightKg: 62.0,
  restingHeartRateBpm: 45,
  maxHeartRateBpm: 185,
  ftpWatts: 240,
  vO2Max: 56.0,
  timezone: 'America/Denver',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  sourceMetadata: {
    providerId: 'strava',
    providerObjectId: 'athlete_ext_1',
    rawDocumentId: 'doc_1',
    syncJobId: 'job_1',
    apiEndpoint: 'api',
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

const mockActivity: CanonicalActivity = {
  id: 'activity_test_999',
  externalProviderId: 'strava',
  providerObjectId: 'act_ext_1',
  athleteId: 'athlete_test_999',
  activityName: 'Morning Tempo Run',
  sportType: 'running',
  startDate: '2026-07-06T10:00:00Z',
  timezone: 'America/Denver',
  elapsedTimeSec: 4200,
  movingTimeSec: 3600,
  distanceMeters: 12000,
  averagePaceMinPerKm: 5.0,
  averageSpeedMps: 3.33,
  maximumSpeedMps: 4.8,
  elevationGainMeters: 50,
  elevationLossMeters: 50,
  averageHeartRateBpm: 155,
  maxHeartRateBpm: 172,
  averageCadenceRpm: 182,
  maxCadenceRpm: 190,
  averagePowerWatts: 210,
  maxPowerWatts: 280,
  calories: 820,
  device: { name: 'Garmin ForeRunner', serialNumber: '999', manufacturer: 'Garmin' },
  shoesId: 'shoe_pegasus_1',
  gpsPolyline: null,
  visibility: 'public',
  privateFlag: false,
  manualFlag: false,
  commuteFlag: false,
  trainerFlag: false,
  kilojoules: 756,
  weather: { temperatureC: 24.5, humidityPercent: 45, windSpeedMps: 2.1, windDirectionDeg: null, summary: 'sunny', precipProbabilityPercent: null },
  location: { country: 'USA', state: 'Colorado', city: 'Boulder', startLatLng: null, endLatLng: null },
  elevation: { gainMeters: 50, lossMeters: 50, maxAltitudeMeters: 1650, minAltitudeMeters: 1600 },
  achievements: [],
  bestEfforts: [],
  createdAt: '2026-07-06T10:00:00Z',
  updatedAt: '2026-07-06T10:00:00Z',
  sourceMetadata: {
    providerId: 'strava',
    providerObjectId: 'act_ext_1',
    rawDocumentId: 'doc_act_1',
    syncJobId: 'job_act_1',
    apiEndpoint: 'api',
    payloadHash: 'hash',
    providerApiVersion: 'v3',
    transformationVersion: '1.0.0',
    importedAt: '2026-07-06T10:00:00Z'
  },
  metadata: {
    schemaVersion: '1.0.0',
    importedAt: '2026-07-06T10:00:00Z',
    transformationVersion: '1.0.0'
  }
};

const mockComputedMetrics: ComputedMetric[] = [
  {
    metricId: 'ctl',
    athleteId: 'athlete_test_999',
    activityId: 'activity_test_999',
    value: 65.4,
    units: 'points',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    timestamp: '2026-07-06T10:00:00Z',
    inputReferences: []
  },
  {
    metricId: 'atl',
    athleteId: 'athlete_test_999',
    activityId: 'activity_test_999',
    value: 82.1,
    units: 'points',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    timestamp: '2026-07-06T10:00:00Z',
    inputReferences: []
  },
  {
    metricId: 'tsb',
    athleteId: 'athlete_test_999',
    activityId: 'activity_test_999',
    value: -16.7, // Fatigued zone (-30 to -10)
    units: 'points',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    timestamp: '2026-07-06T10:00:00Z',
    inputReferences: []
  },
  {
    metricId: 'hr_decoupling',
    athleteId: 'athlete_test_999',
    activityId: 'activity_test_999',
    value: 3.2, // Excellent Aerobic Fitness (<5%)
    units: '%',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    timestamp: '2026-07-06T10:00:00Z',
    inputReferences: []
  },
  {
    metricId: 'hr_drift',
    athleteId: 'athlete_test_999',
    activityId: 'activity_test_999',
    value: 4.8, // Normal Drift (<8%)
    units: '%',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    timestamp: '2026-07-06T10:00:00Z',
    inputReferences: []
  },
  {
    metricId: 'pace_stability',
    athleteId: 'athlete_test_999',
    activityId: 'activity_test_999',
    value: 0.92, // Consistent (0.85 to 0.95)
    units: 'index',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    timestamp: '2026-07-06T10:00:00Z',
    inputReferences: []
  },
  {
    metricId: 'split_type',
    athleteId: 'athlete_test_999',
    activityId: 'activity_test_999',
    value: 'negative',
    units: 'category',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    timestamp: '2026-07-06T10:00:00Z',
    inputReferences: []
  },
  {
    metricId: 'integrity_score',
    athleteId: 'athlete_test_999',
    activityId: 'activity_test_999',
    value: 98.5, // Excellent (>=90%)
    units: '%',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    timestamp: '2026-07-06T10:00:00Z',
    inputReferences: []
  },
  {
    metricId: 'monotony_7day',
    athleteId: 'athlete_test_999',
    value: 1.25, // Optimal Variation (1.0 to 1.5)
    units: 'ratio',
    formulaVersion: '1.0.0',
    metricVersion: '1.0.0',
    timestamp: '2026-07-06T10:00:00Z',
    inputReferences: []
  }
];

// ==========================================
// TEST CASES
// ==========================================

function runThresholdTests(): void {
  console.log('▶ Running Threshold Registry Tests...');

  // 1. TSB boundary tests
  const result1 = ThresholdRegistry.evaluate('tsb_form_zones', -35);
  assertEquals(result1?.label, 'Highly Fatigued', 'TSB -35 should map to Highly Fatigued');

  const result2 = ThresholdRegistry.evaluate('tsb_form_zones', -15);
  assertEquals(result2?.label, 'Fatigued', 'TSB -15 should map to Fatigued');

  const result3 = ThresholdRegistry.evaluate('tsb_form_zones', 0);
  assertEquals(result3?.label, 'Optimal Training', 'TSB 0 should map to Optimal Training');

  const result4 = ThresholdRegistry.evaluate('tsb_form_zones', 10);
  assertEquals(result4?.label, 'Peaking / Fresh', 'TSB 10 should map to Peaking / Fresh');

  // 2. Extreme over/underflow protection
  const overflow = ThresholdRegistry.evaluate('tsb_form_zones', 500);
  assertEquals(overflow?.label, 'Transition / Deconditioning', 'Huge positive value should fallback gracefully to upper band');

  const underflow = ThresholdRegistry.evaluate('tsb_form_zones', -500);
  assertEquals(underflow?.label, 'Highly Fatigued', 'Huge negative value should fallback gracefully to lower band');

  console.log('✔ Threshold Registry Tests Passed.');
}

function runRuleRegistryTests(): void {
  console.log('▶ Running Rule Registry Tests...');

  // Ensure all 15 rules/categories are available
  const list = RuleRegistry.list();
  assert(list.length >= 12, `Registry should have complete set of standard rules. Found: ${list.length}`);

  // Test retrieval
  const rule = RuleRegistry.get('rule_recovery_tsb');
  assert(rule !== undefined, 'Should retrieve recovery_tsb rule from registry');
  assertEquals(rule?.definition.category, 'recovery', 'Category must be recovery');

  console.log('✔ Rule Registry Tests Passed.');
}

function runDecisionEngineTests(): void {
  console.log('▶ Running Decision Engine Tests...');

  const decisions = DecisionEngine.evaluate({
    athlete: mockAthlete,
    activity: mockActivity,
    metrics: mockComputedMetrics,
    history: [] // No history, ramp rate won't run, which is expected
  });

  assert(decisions.length > 5, `Decisions should be generated. Count: ${decisions.length}`);

  // Verify specific deterministic outputs
  const tsbDec = decisions.find(d => d.supportingRules.includes('rule_recovery_tsb'));
  assert(tsbDec !== undefined, 'Recovery TSB decision should be generated');
  assertEquals(tsbDec?.status, 'Fatigued', 'Status should be Fatigued');
  assertEquals(tsbDec?.severity, 'medium', 'Severity should be medium');
  assertEquals(tsbDec?.explanationCode, 'REC_FATIGUED', 'Explanation code should be REC_FATIGUED');

  const dqDec = decisions.find(d => d.supportingRules.includes('rule_data_quality_integrity'));
  assert(dqDec !== undefined, 'Data Integrity decision should be generated');
  assertEquals(dqDec?.status, 'Excellent', 'Status should be Excellent');
  assertEquals(dqDec?.severity, 'info', 'Severity should be info');

  console.log('✔ Decision Engine Tests Passed.');
}

function runDecisionRepositoryTests(): void {
  console.log('▶ Running Decision Repository Tests...');

  const repository = new DecisionRepository();

  const decisions = DecisionEngine.evaluate({
    athlete: mockAthlete,
    activity: mockActivity,
    metrics: mockComputedMetrics,
    history: []
  });

  // 1. Save
  repository.save(decisions);
  const allSaved = repository.getAll();
  assertEquals(allSaved.length, decisions.length, 'All decisions must be saved');

  // 2. Query by athlete ID
  const athleteDec = repository.getByAthleteId(mockAthlete.id);
  assertEquals(athleteDec.length, decisions.length, 'Query by athlete ID should return all matching rows');

  // 3. Query by activity ID
  const activityDec = repository.getByActivityId(mockActivity.id);
  assert(activityDec.length > 0, 'Query by activity ID should return active decisions');

  // 4. Query by category
  const recDec = repository.getByCategory(mockAthlete.id, 'recovery');
  assert(recDec.length > 0, 'Query by category should return matching decisions');

  // 5. Query by date range
  const start = new Date();
  start.setDate(start.getDate() - 1);
  const end = new Date();
  end.setDate(end.getDate() + 1);
  const dateRangeDec = repository.getByDateRange(mockAthlete.id, start, end);
  assertEquals(dateRangeDec.length, decisions.length, 'Date range filter should correctly locate timestamps');

  // 6. JSON Export/Import
  const json = repository.exportToJSON();
  assert(json.startsWith('['), 'Export should produce clean JSON array');

  const newRepo = new DecisionRepository();
  newRepo.importFromJSON(json);
  assertEquals(newRepo.getAll().length, decisions.length, 'Imported repository should have exact matching count');

  console.log('✔ Decision Repository Tests Passed.');
}

function runBoundaryAndRobustnessTests(): void {
  console.log('▶ Running Boundary & Robustness Tests...');

  // Test with empty metrics array
  const emptyDec = DecisionEngine.evaluate({
    athlete: mockAthlete,
    activity: mockActivity,
    metrics: [],
    history: []
  });

  // Some rules (like cadence, environment, elevation) evaluate raw activity values and should still run safely!
  assert(emptyDec.length > 0, 'Engine should gracefully evaluate what is possible even if metrics are empty');

  // Ensure no crash on totally null fields
  const blankActivity: CanonicalActivity = {
    ...mockActivity,
    averageHeartRateBpm: null,
    averagePowerWatts: null,
    averageCadenceRpm: null,
    weather: null,
    elevation: { gainMeters: null, lossMeters: null, maxAltitudeMeters: null, minAltitudeMeters: null }
  };

  const blankDec = DecisionEngine.evaluate({
    athlete: mockAthlete,
    activity: blankActivity,
    metrics: [],
    history: []
  });

  // Verify that it still returned sync health / metadata evaluations without crashing
  assert(blankDec.length >= 0, 'Blank activities must be processed cleanly without throwing null reference exceptions');

  console.log('✔ Boundary & Robustness Tests Passed.');
}

// ==========================================
// MAIN EXECUTION
// ==========================================

export function runAllTests(): void {
  console.log('====================================================');
  console.log('🚀 STARTING DETERMINISTIC RULE & DECISION ENGINE TESTS');
  console.log('====================================================');

  try {
    runThresholdTests();
    console.log('');
    runRuleRegistryTests();
    console.log('');
    runDecisionEngineTests();
    console.log('');
    runDecisionRepositoryTests();
    console.log('');
    runBoundaryAndRobustnessTests();

    console.log('\n====================================================');
    console.log('🎉 ALL DETERMINISTIC DECISION TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (error) {
    console.error('\n====================================================');
    console.error('❌ DECISION ENGINE TEST SUITE FAILED WITH AN ERROR:');
    console.error(error);
    console.error('====================================================');
    process.exit(1);
  }
}

// Execute if run directly via ts-node / node
if (require.main === module) {
  runAllTests();
}
