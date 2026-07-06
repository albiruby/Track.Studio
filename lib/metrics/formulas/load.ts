import { CanonicalActivity, CanonicalStream, CanonicalAthlete } from '@/lib/data-platform/canonical/types';
import { calculateTimeInHRZones } from './heart-rate';
import { calculateNormalizedPower } from './power';

export const FORMULA_VERSION = '1.0.0';

/**
 * Session Load (simple duration-based load weighted by an arbitrary RPE/Intensity factor)
 * Session Load = Duration (minutes) * RPE (1-10)
 * Default RPE = 6 (Moderate-Hard effort)
 */
export function calculateSessionLoad(activity: CanonicalActivity, rpe = 6): number {
  const durationMin = activity.movingTimeSec / 60;
  return parseFloat((durationMin * rpe).toFixed(1));
}

/**
 * Bannister TRIMP (Training Impulse)
 * Formula: w = T * y * e^(b * y)
 * T = duration in minutes
 * y = fractional HR reserve = (HRavg - HRrest) / (HRmax - HRrest)
 * b = 1.92 for males, 1.67 for females (default 1.92 if gender is null/unspecified)
 */
export function calculateBannisterTRIMP(activity: CanonicalActivity, athlete: CanonicalAthlete): number | null {
  const avgHr = activity.averageHeartRateBpm;
  const maxHr = athlete.maxHeartRateBpm || activity.maxHeartRateBpm || 190;
  const restingHr = athlete.restingHeartRateBpm || 60;

  if (!avgHr || avgHr <= restingHr) return 0;

  const hrr = maxHr - restingHr;
  if (hrr <= 0) return 0;

  const y = (avgHr - restingHr) / hrr;
  const t = activity.movingTimeSec / 60; // duration in minutes
  
  const b = athlete.gender === 'F' ? 1.67 : 1.92;
  const trimp = t * y * Math.exp(b * y);
  
  return parseFloat(trimp.toFixed(2));
}

/**
 * Edwards TRIMP
 * Edwards TRIMP divides HR into 5 zones based on Max HR percentages and multiplies the duration spent in each zone by a zone factor:
 * Z1 (50-60% Max HR): Factor 1
 * Z2 (60-70% Max HR): Factor 2
 * Z3 (70-80% Max HR): Factor 3
 * Z4 (80-90% Max HR): Factor 4
 * Z5 (90-100% Max HR): Factor 5
 * Formula: Sum(Time_Zone_i * Factor_i)
 */
export function calculateEdwardsTRIMP(activity: CanonicalActivity, athlete: CanonicalAthlete, stream?: CanonicalStream): number {
  const zoneTimesSec = calculateTimeInHRZones(activity, athlete, stream);
  
  // Convert seconds to minutes
  const t1 = zoneTimesSec[0] / 60;
  const t2 = zoneTimesSec[1] / 60;
  const t3 = zoneTimesSec[2] / 60;
  const t4 = zoneTimesSec[3] / 60;
  const t5 = zoneTimesSec[4] / 60;

  const edwards = (t1 * 1) + (t2 * 2) + (t3 * 3) + (t4 * 4) + (t5 * 5);
  return parseFloat(edwards.toFixed(2));
}

/**
 * Lucia TRIMP
 * Lucia TRIMP divides intensity into 3 ventilatory zones based on Max HR:
 * Zone I (<70% Max HR): Factor 1
 * Zone II (70-85% Max HR): Factor 2
 * Zone III (>85% Max HR): Factor 3
 */
export function calculateLuciaTRIMP(activity: CanonicalActivity, athlete: CanonicalAthlete, stream?: CanonicalStream): number {
  const maxHr = athlete.maxHeartRateBpm || activity.maxHeartRateBpm || 190;
  
  const thresh1 = maxHr * 0.70;
  const thresh2 = maxHr * 0.85;

  let z1Sec = 0, z2Sec = 0, z3Sec = 0;

  if (stream && stream.heartRateBpm && stream.heartRateBpm.length > 0) {
    for (const hr of stream.heartRateBpm) {
      if (hr < thresh1) z1Sec++;
      else if (hr < thresh2) z2Sec++;
      else z3Sec++;
    }
  } else {
    const avg = activity.averageHeartRateBpm || maxHr * 0.7;
    const dur = activity.movingTimeSec;
    if (avg < thresh1) z1Sec = dur;
    else if (avg < thresh2) z2Sec = dur;
    else z3Sec = dur;
  }

  const lucia = (z1Sec / 60 * 1) + (z2Sec / 60 * 2) + (z3Sec / 60 * 3);
  return parseFloat(lucia.toFixed(2));
}

/**
 * Heart Rate Stress Score (HRSS) / HR Load
 * HRSS = (Duration (sec) * HRr * e^(1.92 * HRr)) / 3600 * 100
 * where HRr = (avgHR - restingHR) / (maxHR - restingHR)
 */
export function calculateHRSS(activity: CanonicalActivity, athlete: CanonicalAthlete): number {
  const avgHr = activity.averageHeartRateBpm;
  const maxHr = athlete.maxHeartRateBpm || activity.maxHeartRateBpm || 190;
  const restingHr = athlete.restingHeartRateBpm || 60;

  if (!avgHr || avgHr <= restingHr) return 0;
  
  const hrr = maxHr - restingHr;
  if (hrr <= 0) return 0;

  const hrrFraction = (avgHr - restingHr) / hrr;
  const factor = athlete.gender === 'F' ? 1.67 : 1.92;
  const hrss = (activity.movingTimeSec * hrrFraction * Math.exp(factor * hrrFraction) / 3600) * 100;
  
  return parseFloat(hrss.toFixed(1));
}

/**
 * Running Stress Score (RSS) / Power-based Load (TSS)
 * RSS = 100 * (Duration (sec) * NP * IF) / (3600 * FTP)
 * where Intensity Factor (IF) = NP / FTP
 */
export function calculateRSS(activity: CanonicalActivity, athlete: CanonicalAthlete, stream?: CanonicalStream): number {
  const ftp = athlete.ftpWatts || activity.averagePowerWatts || 250;
  const np = calculateNormalizedPower(activity, stream) || activity.averagePowerWatts || 0;

  if (ftp <= 0 || np <= 0) {
    // If no power data is available, fall back to HRSS or a speed-based stress score
    const avgPace = activity.averagePaceMinPerKm || 6.0; // 6:00/km
    const durationMin = activity.movingTimeSec / 60;
    // Speed proxy RSS: duration with logarithmic scaling for intensity
    const weightFactor = 6.0 / avgPace; // faster pace increases load
    return parseFloat((durationMin * Math.pow(weightFactor, 2) * 1.1).toFixed(1));
  }

  const intensityFactor = np / ftp;
  const rss = (activity.movingTimeSec * np * intensityFactor / (3600 * ftp)) * 100;
  return parseFloat(rss.toFixed(1));
}

/**
 * Training Stress Score (TSS)
 * TSS = RSS if power-based, else HRSS
 */
export function calculateTSS(activity: CanonicalActivity, athlete: CanonicalAthlete, stream?: CanonicalStream): number {
  if (activity.averagePowerWatts !== null || (stream && stream.powerWatts && stream.powerWatts.length > 0)) {
    return calculateRSS(activity, athlete, stream);
  }
  return calculateHRSS(activity, athlete);
}

/**
 * Mechanical Load
 * Represented as cumulative vertical and horizontal speed changes (accelerations) from stream
 * Sum of absolute differences in velocity plus vertical velocity proxy.
 */
export function calculateMechanicalLoad(stream: CanonicalStream): number {
  if (!stream.velocityMps || stream.velocityMps.length < 2) return 0;
  let load = 0;
  const v = stream.velocityMps;
  const alt = stream.altitudeMeters;

  for (let i = 1; i < v.length; i++) {
    const accHorizontal = Math.abs(v[i] - v[i - 1]);
    const accVertical = alt ? Math.abs(alt[i] - alt[i - 1]) : 0;
    load += accHorizontal + (accVertical * 0.5);
  }

  return parseFloat(load.toFixed(1));
}
