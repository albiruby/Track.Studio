/**
 * Athlete Profiles and Physiological Zones - Track.Studio
 */

export interface HeartRateZones {
  zone1: { min: number; max: number; label: string }; // Active Recovery (Aerobic)
  zone2: { min: number; max: number; label: string }; // Aerobic Capacity (Endurance)
  zone3: { min: number; max: number; label: string }; // Tempo (Aerobic-Anaerobic transition)
  zone4: { min: number; max: number; label: string }; // Lactate Threshold
  zone5: { min: number; max: number; label: string }; // Anaerobic Capacity / VO2 Max
}

export interface PaceZones {
  zone1: { minSpeed: number; maxSpeed: number; label: string }; // Recovery
  zone2: { minSpeed: number; maxSpeed: number; label: string }; // Aerobic/Endurance
  zone3: { minSpeed: number; maxSpeed: number; label: string }; // Tempo
  zone4: { minSpeed: number; maxSpeed: number; label: string }; // Threshold
  zone5: { minSpeed: number; maxSpeed: number; label: string }; // Interval/VO2 Max
}

export interface AthleteProfile {
  userId: string;
  weightKg: number | null;
  gender: 'male' | 'female' | 'prefer-not-to-say' | null;
  dateOfBirth: string | null; // YYYY-MM-DD
  
  // Deterministic Threshold markers (Athlete-provided or verified baseline)
  maxHeartRate: number;       // in bpm (Standard defaults e.g. 220 - age, but overridable)
  restingHeartRate: number;   // in bpm
  
  functionalThresholdPace: number; // in meters/second (e.g., pace at threshold)
  lactateThresholdHeartRate: number | null; // in bpm (FTHR)
  
  // Deterministic zone bounds
  heartRateZones: HeartRateZones;
  paceZones: PaceZones;
  
  createdAt: string;
  updatedAt: string;
}
