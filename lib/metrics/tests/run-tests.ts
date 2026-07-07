/**
 * Standalone Test Runner & Verification Suite for the Sports Science Metric Engine
 */

import { CanonicalActivity, CanonicalAthlete, CanonicalStream, CanonicalSplit } from '@/lib/data-platform/canonical/types';
import { MetricEngine } from '../engine';
import { MetricRegistry } from '../registry';
import { MetricRepository } from '../repository';
import * as formulas from '../formulas';

// Custom lightweight assertion library
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

function assertCloseTo(actual: number, expected: number, delta = 0.01, message: string): void {
  if (Math.abs(actual - expected) > delta) {
    throw new Error(`Assertion Failed: ${message}\nExpected (close to): ${expected}\nActual: ${actual}\nDelta limit: ${delta}`);
  }
}

// ==========================================
// MOCK DATA GENERATION
// ==========================================

const mockAthlete: CanonicalAthlete = {
  id: 'athlete_123',
  firstName: 'John',
  lastName: 'Doe',
  profileUrl: null,
  gender: 'M',
  weightKg: 75.0,
  restingHeartRateBpm: 50,
  maxHeartRateBpm: 190,
  ftpWatts: 300,
  vO2Max: 54.5,
  timezone: 'America/New_York',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  sourceMetadata: {
    providerId: 'strava',
    providerObjectId: '12345',
    rawDocumentId: 'doc_123',
    syncJobId: 'job_123',
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

const mockActivityTemplate = (overrides: Partial<CanonicalActivity>): CanonicalActivity => ({
  id: 'activity_test',
  externalProviderId: 'strava',
  providerObjectId: '98765',
  athleteId: 'athlete_123',
  activityName: 'Standard Test Run',
  sportType: 'running',
  startDate: '2026-06-01T10:00:00Z',
  timezone: 'America/New_York',
  elapsedTimeSec: 3600,
  movingTimeSec: 3600,
  distanceMeters: 10000,
  averagePaceMinPerKm: 6.0,
  averageSpeedMps: 2.78, // 10 km / 3600 sec = 2.78 m/s (~6:00/km)
  maximumSpeedMps: 5.0,
  elevationGainMeters: 100,
  elevationLossMeters: 100,
  averageHeartRateBpm: 140,
  maxHeartRateBpm: 170,
  averageCadenceRpm: 85,
  maxCadenceRpm: 95,
  averagePowerWatts: 250,
  maxPowerWatts: 350,
  calories: 700,
  device: { name: 'Garmin', serialNumber: '123', manufacturer: 'Garmin' },
  shoesId: null,
  gpsPolyline: null,
  visibility: 'only_me',
  privateFlag: true,
  manualFlag: false,
  commuteFlag: false,
  trainerFlag: false,
  kilojoules: 900,
  weather: null,
  location: { country: null, state: null, city: null, startLatLng: null, endLatLng: null },
  elevation: { gainMeters: 100, lossMeters: 100, maxAltitudeMeters: 200, minAltitudeMeters: 100 },
  achievements: [],
  bestEfforts: [],
  sourceMetadata: {
    providerId: 'strava',
    providerObjectId: '98765',
    rawDocumentId: 'doc_activity',
    syncJobId: 'job_123',
    apiEndpoint: 'api',
    payloadHash: 'hash',
    providerApiVersion: 'v3',
    transformationVersion: '1.0.0',
    importedAt: '2026-06-01T11:00:00Z'
  },
  metadata: {
    schemaVersion: '1.0.0',
    importedAt: '2026-06-01T11:00:00Z',
    transformationVersion: '1.0.0'
  },
  createdAt: '2026-06-01T11:00:00Z',
  updatedAt: '2026-06-01T11:00:00Z',
  ...overrides
});

// ==========================================
// TEST SUITES
// ==========================================

function runZeroValueTests(): void {
  console.log('▶ Running Zero Value Tests...');

  // Scenario: Zero-movement activity (e.g., stationary pause / accidental button press)
  const zeroActivity = mockActivityTemplate({
    distanceMeters: 0,
    movingTimeSec: 0,
    elapsedTimeSec: 10,
    averageSpeedMps: 0,
    maximumSpeedMps: 0,
    averagePowerWatts: 0,
    averageHeartRateBpm: null,
    elevationGainMeters: 0,
    elevationLossMeters: 0
  });

  assertEquals(formulas.activity.calculateMovingPace(zeroActivity), 0, 'Moving pace on zero distance should be 0');
  assertEquals(formulas.activity.calculateElapsedPace(zeroActivity), 0, 'Elapsed pace on zero distance should be 0');
  assertEquals(formulas.activity.calculateAverageSpeed(zeroActivity), 0, 'Average speed on zero duration should be 0');
  assertEquals(formulas.activity.calculateMovingSpeed(zeroActivity), 0, 'Moving speed on zero duration should be 0');
  assertEquals(formulas.elevation.calculateClimbingRate(zeroActivity), 0, 'VAM on zero duration should be 0');
  assertEquals(formulas.elevation.calculateAverageGrade(zeroActivity), 0, 'Grade on zero distance should be 0');
  assertEquals(formulas.load.calculateSessionLoad(zeroActivity), 0, 'Session load on zero duration should be 0');

  console.log('✔ Zero Value Tests Passed.');
}

function runNullAndMissingTests(): void {
  console.log('▶ Running Null & Missing Data Tests...');

  // Scenario: Activity missing heart rate and power data (e.g. standard GPS-only watch)
  const missingSensorsActivity = mockActivityTemplate({
    averageHeartRateBpm: null,
    maxHeartRateBpm: null,
    averagePowerWatts: null,
    maxPowerWatts: null,
    averageCadenceRpm: null,
    maxCadenceRpm: null
  });

  assertEquals(formulas.heartRate.calculateAverageHR(missingSensorsActivity), null, 'Average HR should be null');
  assertEquals(formulas.power.calculateAveragePower(missingSensorsActivity), null, 'Average Power should be null');
  assertEquals(formulas.cadence.calculateAverageCadence(missingSensorsActivity), null, 'Average Cadence should be null');
  
  // Power load RSS should fall back gracefully to Speed proxy RSS
  const rss = formulas.load.calculateRSS(missingSensorsActivity, mockAthlete);
  assert(rss > 0, 'Power RSS fallback should calculate speed proxy and be > 0');

  // Edwards TRIMP should calculate 0 on missing heart rate without throwing
  const edwards = formulas.load.calculateEdwardsTRIMP(missingSensorsActivity, mockAthlete);
  assertEquals(edwards, 0, 'Edwards TRIMP should return 0 if no HR is available');

  console.log('✔ Null & Missing Data Tests Passed.');
}

function runExtremeValueTests(): void {
  console.log('▶ Running Extreme Value & Boundary Tests...');

  // Scenario: Massive GPS speed spike (100 m/s = 360 km/h)
  const spikedActivity = mockActivityTemplate({
    maximumSpeedMps: 100,
    elevationGainMeters: 12000, // higher than Mt. Everest climb
    movingTimeSec: 10 // ultra short
  });

  // Verify elevation density doesn't crash on high climbs with short distance
  const denseClimb = formulas.elevation.calculateElevationDensity(spikedActivity);
  assert(denseClimb > 0, 'Elevation density should compute on extreme vertical climbs');

  // Verify best pace handles high speed stream or fallback correctly
  const bestPace = formulas.pacing.calculateBestPace(spikedActivity);
  assert(bestPace > 0, 'Best pace should calculate safely');

  console.log('✔ Extreme Value Tests Passed.');
}

function runHeartRateFormulaTests(): void {
  console.log('▶ Running Heart Rate Formula Tests...');

  const activity = mockActivityTemplate({ averageHeartRateBpm: 155 });
  
  // 1. HRR (Heart Rate Reserve) = Max - Rest = 190 - 50 = 140
  const hrr = formulas.heartRate.calculateHRR(mockAthlete);
  assertEquals(hrr, 140, 'HRR should be 140');

  // 2. HRR % = (AvgHR - Rest) / HRR * 100 = (155 - 50) / 140 * 100 = 75%
  const hrrPercentage = formulas.heartRate.calculateHRRPercentage(activity, mockAthlete);
  assertEquals(hrrPercentage, 75.0, 'HRR% should be 75.0%');

  // 3. Submaximal activity VO2max estimation
  const estVo2 = formulas.performance.estimateActivityVO2Max(activity, mockAthlete);
  assert(estVo2 !== null && estVo2 > 30 && estVo2 < 70, 'Submaximal VO2Max should return realistic value');

  console.log('✔ Heart Rate Formula Tests Passed.');
}

function runTrainingLoadAndDecayTests(): void {
  console.log('▶ Running Multi-Workout Training Load & EWMA Decay Tests...');

  // Create a 60-day historical training log to verify CTL (Fitness), ATL (Fatigue), TSB (Form) curves
  const history: CanonicalActivity[] = [];
  const baseDate = new Date('2026-01-01T12:00:00Z');

  // Athlete runs daily for the first 14 days (consistent stress), then rests for 30 days (decay)
  for (let i = 0; i < 45; i++) {
    const actDate = new Date(baseDate);
    actDate.setDate(baseDate.getDate() + i);

    if (i < 14) {
      // 10km run with 100 TSS load daily
      history.push(
        mockActivityTemplate({
          id: `act_day_${i}`,
          startDate: actDate.toISOString(),
          movingTimeSec: 3600,
          averagePowerWatts: 250, // 100 TSS
          averageHeartRateBpm: 150
        })
      );
    }
  }

  // Calculate timelines
  const trends = formulas.recovery.calculatePerformanceTrends(history, mockAthlete);
  assert(trends.length > 0, 'Trends array should be generated');

  // Chronological verification
  const initialDay = trends[0];
  assertEquals(initialDay.load, 100, 'Initial day load should be 100');
  
  // CTL Day 1: 0 + (100 - 0) / 42 = 2.38
  assertCloseTo(initialDay.ctl, 2.38, 0.1, 'CTL Day 1 should be approx 2.38');
  // ATL Day 1: 0 + (100 - 0) / 7 = 14.28
  assertCloseTo(initialDay.atl, 14.28, 0.1, 'ATL Day 1 should be approx 14.28');
  // TSB Day 1: Yesterday's CTL - Yesterday's ATL = 0 - 0 = 0
  assertEquals(initialDay.tsb, 0, 'TSB Day 1 should be exactly 0');

  // Day 14 (end of consistent high load phase): Fitness should have climbed, fatigue is high, form is very negative
  const day14 = trends[13];
  assert(day14.ctl > 20, 'CTL should rise significantly after 14 days of training');
  assert(day14.atl > 75, 'ATL should be very high due to consecutive stress');
  assert(day14.tsb < -40, 'TSB should be heavily negative (Fatigued Form)');

  // Last day (day 45, after 31 days of rest): Fatigue (ATL) decays much faster than Fitness (CTL), Form (TSB) becomes positive
  const lastDay = trends[trends.length - 1];
  assertEquals(lastDay.load, 0, 'Load on rest days should be 0');
  assert(lastDay.atl < 2.0, 'Fatigue should have decayed close to 0 after 30 days');
  assert(lastDay.ctl > 1.0, 'Fitness should still remain above 0 (longer decay constant of 42 days)');
  assert(lastDay.tsb > 0, 'TSB should be positive (Supercompensated / Rested Form)');

  console.log('✔ Multi-Workout Training Load & Decay Tests Passed.');
}

function runStreamBasedTests(): void {
  console.log('▶ Running Timeseries Stream Metric Tests...');

  // Build a synthetic 1Hz running stream representing a 10-minute (600s) progressive run
  const streamLength = 600;
  const timeSec: number[] = [];
  const distanceMeters: number[] = [];
  const heartRateBpm: number[] = [];
  const velocityMps: number[] = [];
  const powerWatts: number[] = [];

  for (let i = 0; i < streamLength; i++) {
    timeSec.push(i);
    distanceMeters.push(i * 3); // 3 m/s constant speed
    velocityMps.push(3.0);
    // Heart rate starts at 110 and drifts up to 150 (Cardio Drift)
    heartRateBpm.push(110 + (i / streamLength) * 40);
    powerWatts.push(250); // steady power
  }

  const mockStream: CanonicalStream = {
    activityId: 'activity_test',
    streamTypes: ['time', 'distance', 'heartrate', 'velocity_smooth', 'watts'],
    timeSec,
    distanceMeters,
    latlng: null,
    altitudeMeters: null,
    velocityMps,
    heartRateBpm,
    cadenceRpm: null,
    powerWatts,
    temperatureC: null,
    moving: null,
    sourceMetadata: mockAthlete.sourceMetadata,
    metadata: mockAthlete.metadata
  };

  const activity = mockActivityTemplate({
    elapsedTimeSec: streamLength,
    movingTimeSec: streamLength,
    distanceMeters: streamLength * 3,
    averageHeartRateBpm: 130
  });

  // Calculate cardiac drift: 2nd half average HR vs 1st half average HR
  const drift = formulas.heartRate.calculateHRDrift(mockStream);
  assert(drift !== null && drift > 0, 'Heart rate drift should be positive');
  assertCloseTo(drift!, 16.67, 0.5, 'HR drift should be approx 16.67%');

  // Calculate data integrity score (continuous high quality stream)
  const score = formulas.dataQuality.calculateDataIntegrityScore(activity, mockStream);
  assert(score > 90.0, 'Continuous stream with HR, Power, Speed should score > 90% integrity');

  // Calculate Normalized Power (steady power = 250 Watts, NP should equal 250 Watts)
  const np = formulas.power.calculateNormalizedPower(activity, mockStream);
  assertEquals(np, 250, 'NP of perfectly steady power should be equal to the power value itself');

  console.log('✔ Timeseries Stream Metric Tests Passed.');
}

function runEngineAndRepositoryIntegrationTests(): void {
  console.log('▶ Running MetricEngine and Repository Integration Tests...');

  const repository = new MetricRepository();
  const activity = mockActivityTemplate({});

  // 1. Evaluate single activity
  const activityMetrics = MetricEngine.evaluateActivity({
    activity,
    athlete: mockAthlete
  });

  assert(activityMetrics.length > 15, 'Engine should compute multiple single-activity metrics');
  
  // 2. Save to repository
  repository.save(activityMetrics);

  const saved = repository.getByActivityId(activity.id);
  assertEquals(saved.length, activityMetrics.length, 'All computed metrics should be saved in repository');

  // 3. Query specific category
  const qualityMetrics = repository.getByCategory(mockAthlete.id, 'data-quality');
  assert(qualityMetrics.length > 0, 'Should retrieve quality category metrics');

  console.log('✔ Engine and Repository Integration Tests Passed.');
}

// ==========================================
// RUN ALL TESTS
// ==========================================

export function runAllTests(): void {
  console.log('====================================================');
  console.log('🚀 STARTING SPORTS SCIENCE METRIC ENGINE TEST SUITE');
  console.log('====================================================');

  try {
    runZeroValueTests();
    console.log('');
    runNullAndMissingTests();
    console.log('');
    runExtremeValueTests();
    console.log('');
    runHeartRateFormulaTests();
    console.log('');
    runTrainingLoadAndDecayTests();
    console.log('');
    runStreamBasedTests();
    console.log('');
    runEngineAndRepositoryIntegrationTests();
    
    console.log('\n====================================================');
    console.log('🎉 ALL SPORTS SCIENCE METRIC TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (error) {
    console.error('\n====================================================');
    console.error('❌ TEST SUITE FAILED WITH AN ERROR:');
    console.error(error);
    console.error('====================================================');
    process.exit(1);
  }
}

// Execute if run directly via ts-node / node
if (require.main === module) {
  runAllTests();
}
