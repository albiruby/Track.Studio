import { CanonicalActivity, CanonicalStream } from '@/lib/data-platform/canonical/types';

export const FORMULA_VERSION = '1.0.0';

/**
 * Calculates GPS stream coverage percentage
 */
export function calculateGPSCoverage(stream?: CanonicalStream): number {
  if (!stream || !stream.latlng || stream.latlng.length === 0) return 0;
  const valid = stream.latlng.filter(coord => coord && coord.length === 2 && !isNaN(coord[0]) && !isNaN(coord[1])).length;
  return parseFloat(((valid / stream.latlng.length) * 100).toFixed(2));
}

/**
 * Calculates Heart Rate stream coverage percentage
 */
export function calculateHRCoverage(stream?: CanonicalStream): number {
  if (!stream || !stream.heartRateBpm || stream.heartRateBpm.length === 0) return 0;
  const valid = stream.heartRateBpm.filter(hr => typeof hr === 'number' && hr > 30).length;
  return parseFloat(((valid / stream.heartRateBpm.length) * 100).toFixed(2));
}

/**
 * Calculates Power stream coverage percentage
 */
export function calculatePowerCoverage(stream?: CanonicalStream): number {
  if (!stream || !stream.powerWatts || stream.powerWatts.length === 0) return 0;
  const valid = stream.powerWatts.filter(pw => typeof pw === 'number' && pw >= 0).length;
  return parseFloat(((valid / stream.powerWatts.length) * 100).toFixed(2));
}

/**
 * Calculates Cadence stream coverage percentage
 */
export function calculateCadenceCoverage(stream?: CanonicalStream): number {
  if (!stream || !stream.cadenceRpm || stream.cadenceRpm.length === 0) return 0;
  const valid = stream.cadenceRpm.filter(cd => typeof cd === 'number' && cd >= 0).length;
  return parseFloat(((valid / stream.cadenceRpm.length) * 100).toFixed(2));
}

/**
 * Calculates Recording Quality (points per second of elapsed time)
 * A standard 1Hz recording is 1 point per second (Quality = 1.0)
 */
export function calculateRecordingFrequencyHz(activity: CanonicalActivity, stream?: CanonicalStream): number {
  if (!stream || stream.timeSec.length === 0 || activity.elapsedTimeSec <= 0) return 0;
  const count = stream.timeSec.length;
  return parseFloat((count / activity.elapsedTimeSec).toFixed(3));
}

/**
 * Validates sensor reliability by detecting flatlines (constant sensor readings for too long)
 * and dropouts.
 */
export function checkSensorReliability(stream?: CanonicalStream): { hrReliable: boolean; powerReliable: boolean; cadenceReliable: boolean } {
  const result = { hrReliable: true, powerReliable: true, cadenceReliable: true };
  if (!stream) return result;

  const maxFlatlineCount = 60; // 60 seconds with exact same sensor value is suspicious unless it's zero/power off

  const hasFlatline = (arr: number[] | null, filterZero = false): boolean => {
    if (!arr || arr.length < maxFlatlineCount) return false;
    let consecutiveSame = 1;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] === arr[i - 1] && (!filterZero || arr[i] !== 0)) {
        consecutiveSame++;
        if (consecutiveSame >= maxFlatlineCount) return true;
      } else {
        consecutiveSame = 1;
      }
    }
    return false;
  };

  if (stream.heartRateBpm && stream.heartRateBpm.length > 0) {
    if (hasFlatline(stream.heartRateBpm)) {
      result.hrReliable = false; // Heart rate shouldn't be exactly the same for 60 consecutive seconds
    }
  }

  if (stream.powerWatts && stream.powerWatts.length > 0) {
    if (hasFlatline(stream.powerWatts, true)) {
      result.powerReliable = false; // Non-zero power shouldn't flatline perfectly
    }
  }

  if (stream.cadenceRpm && stream.cadenceRpm.length > 0) {
    if (hasFlatline(stream.cadenceRpm, true)) {
      result.cadenceReliable = false; // Running cadence shouldn't be a perfect constant
    }
  }

  return result;
}

/**
 * Computes an overall Data Integrity Score from 0 to 100%
 */
export function calculateDataIntegrityScore(activity: CanonicalActivity, stream?: CanonicalStream): number {
  if (!stream) return 50.0; // Summary data only is rated at 50% integrity baseline

  let scoresSum = 0;
  let tracks = 0;

  // GPS Track
  if (stream.latlng && stream.latlng.length > 0) {
    scoresSum += calculateGPSCoverage(stream);
    tracks++;
  }

  // Heart Rate Track
  if (stream.heartRateBpm && stream.heartRateBpm.length > 0) {
    scoresSum += calculateHRCoverage(stream);
    tracks++;
  }

  // Power Track
  if (stream.powerWatts && stream.powerWatts.length > 0) {
    scoresSum += calculatePowerCoverage(stream);
    tracks++;
  }

  // Cadence Track
  if (stream.cadenceRpm && stream.cadenceRpm.length > 0) {
    scoresSum += calculateCadenceCoverage(stream);
    tracks++;
  }

  // Density Score (aiming for 1Hz = 1.0)
  const freq = calculateRecordingFrequencyHz(activity, stream);
  const densityScore = Math.min(100, Math.max(0, freq * 100));
  scoresSum += densityScore;
  tracks++;

  // Reliability deductions
  const reliability = checkSensorReliability(stream);
  let deductions = 0;
  if (!reliability.hrReliable) deductions += 15;
  if (!reliability.powerReliable) deductions += 15;
  if (!reliability.cadenceReliable) deductions += 10;

  if (tracks === 0) return 50.0;
  const avgScore = scoresSum / tracks;
  return parseFloat(Math.max(0, avgScore - deductions).toFixed(2));
}
