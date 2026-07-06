export interface SourceMetadata {
  providerId: 'strava' | 'intervals-icu';
  providerObjectId: string;
  rawDocumentId: string;
  syncJobId: string;
  apiEndpoint: string;
  payloadHash: string;
  providerApiVersion: string;
  transformationVersion: string; // e.g. '1.0.0'
  importedAt: string; // ISO DateTime
}

export interface CanonicalMetadata {
  schemaVersion: string; // '1.0.0'
  importedAt: string; // ISO DateTime
  transformationVersion: string; // '1.0.0'
}

export interface CanonicalAthlete {
  id: string; // Internal User UID (matches Firebase Auth)
  firstName: string;
  lastName: string;
  profileUrl: string | null;
  gender: 'M' | 'F' | 'Other' | null;
  weightKg: number | null;
  restingHeartRateBpm: number | null;
  maxHeartRateBpm: number | null;
  ftpWatts: number | null;
  vO2Max: number | null;
  timezone: string | null;
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
  sourceMetadata: SourceMetadata;
  metadata: CanonicalMetadata;
}

export interface CanonicalLocation {
  country: string | null;
  state: string | null;
  city: string | null;
  startLatLng: [number, number] | null;
  endLatLng: [number, number] | null;
}

export interface CanonicalElevation {
  gainMeters: number | null;
  lossMeters: number | null;
  maxAltitudeMeters: number | null;
  minAltitudeMeters: number | null;
}

export interface CanonicalWeather {
  temperatureC: number | null;
  humidityPercent: number | null;
  windSpeedMps: number | null;
  windDirectionDeg: number | null;
  summary: string | null;
  precipProbabilityPercent: number | null;
}

export interface CanonicalDevice {
  name: string | null;
  serialNumber: string | null;
  manufacturer: string | null;
}

export interface CanonicalAchievement {
  name: string;
  description: string | null;
  rank: number; // e.g., 1 = Gold, 2 = Silver, 3 = Bronze, etc.
  type: string; // 'PR' | 'Segment_KOM' | 'Overall'
}

export interface CanonicalBestEffort {
  name: string; // '1k' | '1mi' | '5k' | '10k' | 'Half-Marathon'
  distanceMeters: number;
  elapsedTimeSec: number;
  movingTimeSec: number;
  startIndex: number | null;
  endIndex: number | null;
}

export interface CanonicalActivity {
  id: string; // deterministic internal UUID or hash
  externalProviderId: string; // provider ID (e.g., 'strava')
  providerObjectId: string; // vendor activity id
  athleteId: string; // internal Athlete UUID
  activityName: string;
  sportType: 'running' | 'trail_running' | 'other';
  startDate: string; // ISO DateTime
  timezone: string; // e.g. 'America/New_York'
  elapsedTimeSec: number;
  movingTimeSec: number;
  distanceMeters: number;
  averagePaceMinPerKm: number; // pace normalized: mm:ss in decimal, e.g. 5.5 = 5:30/km
  averageSpeedMps: number; // meters per second
  maximumSpeedMps: number;
  elevationGainMeters: number;
  elevationLossMeters: number;
  averageHeartRateBpm: number | null;
  maxHeartRateBpm: number | null;
  averageCadenceRpm: number | null;
  maxCadenceRpm: number | null;
  averagePowerWatts: number | null;
  maxPowerWatts: number | null;
  calories: number | null;
  device: CanonicalDevice;
  shoesId: string | null; // references CanonicalGear ID
  gpsPolyline: string | null;
  visibility: 'public' | 'followers_only' | 'only_me';
  privateFlag: boolean;
  manualFlag: boolean;
  commuteFlag: boolean;
  trainerFlag: boolean;
  kilojoules: number | null;
  weather: CanonicalWeather | null;
  location: CanonicalLocation;
  elevation: CanonicalElevation;
  achievements: CanonicalAchievement[];
  bestEfforts: CanonicalBestEffort[];
  sourceMetadata: SourceMetadata;
  metadata: CanonicalMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface CanonicalLap {
  id: string; // UUID/hash
  activityId: string; // references CanonicalActivity.id
  lapIndex: number;
  name: string;
  elapsedTimeSec: number;
  movingTimeSec: number;
  distanceMeters: number;
  averageSpeedMps: number;
  maxSpeedMps: number;
  averageHeartRateBpm: number | null;
  maxHeartRateBpm: number | null;
  averageCadenceRpm: number | null;
  averagePowerWatts: number | null;
  maxPowerWatts: number | null;
  elevationGainMeters: number | null;
  elevationLossMeters: number | null;
  startDate: string; // ISO DateTime
  startIndex: number | null;
  endIndex: number | null;
  sourceMetadata: SourceMetadata;
  metadata: CanonicalMetadata;
}

export interface CanonicalSplit {
  activityId: string; // references CanonicalActivity.id
  splitIndex: number;
  distanceMeters: number;
  elapsedTimeSec: number;
  movingTimeSec: number;
  elevationDifferenceMeters: number | null;
  averageSpeedMps: number;
  averageHeartRateBpm: number | null;
  averageCadenceRpm: number | null;
  averagePowerWatts: number | null;
  splitType: 'kilometer' | 'mile';
}

export interface CanonicalStream {
  activityId: string; // references CanonicalActivity.id
  streamTypes: string[]; // ['time', 'distance', 'latlng', 'altitude', 'velocity_smooth', 'heartrate', 'cadence', 'watts', 'temp', 'moving']
  timeSec: number[];
  distanceMeters: number[] | null;
  latlng: [number, number][] | null;
  altitudeMeters: number[] | null;
  velocityMps: number[] | null;
  heartRateBpm: number[] | null;
  cadenceRpm: number[] | null;
  powerWatts: number[] | null;
  temperatureC: number[] | null;
  moving: boolean[] | null;
  sourceMetadata: SourceMetadata;
  metadata: CanonicalMetadata;
}

export interface CanonicalSegment {
  id: string; // provider segment ID
  name: string;
  distanceMeters: number;
  averageGradePercent: number;
  maximumGradePercent: number;
  elevationHighMeters: number;
  elevationLowMeters: number;
  startLatLng: [number, number] | null;
  endLatLng: [number, number] | null;
  climbCategory: number;
  city: string | null;
  state: string | null;
  country: string | null;
  privateFlag: boolean;
  sourceMetadata: SourceMetadata;
  metadata: CanonicalMetadata;
}

export interface CanonicalRoute {
  id: string;
  athleteId: string;
  name: string;
  description: string | null;
  distanceMeters: number;
  elevationGainMeters: number;
  mapPolyline: string | null;
  sportType: 'running' | 'trail_running' | 'other';
  createdAt: string; // ISO DateTime
  sourceMetadata: SourceMetadata;
  metadata: CanonicalMetadata;
}

export interface CanonicalGear {
  id: string; // gear id (e.g., shoe id)
  athleteId: string;
  name: string;
  brandName: string | null;
  modelName: string | null;
  distanceMeters: number;
  isPrimary: boolean;
  description: string | null;
  retired: boolean;
  type: 'shoes' | 'other';
  sourceMetadata: SourceMetadata;
  metadata: CanonicalMetadata;
}

export interface CanonicalWorkout {
  id: string;
  athleteId: string;
  name: string;
  description: string | null;
  sportType: 'running' | 'other';
  durationSec: number | null;
  distanceMeters: number | null;
  sourceMetadata: SourceMetadata;
  metadata: CanonicalMetadata;
}

export interface HeartRateZoneDetail {
  name: string;
  minBpm: number;
  maxBpm: number;
}

export interface CanonicalHeartRateZones {
  athleteId: string;
  restingHeartRateBpm: number;
  maxHeartRateBpm: number;
  zones: HeartRateZoneDetail[];
  sourceMetadata: SourceMetadata;
  metadata: CanonicalMetadata;
}

export interface PowerZoneDetail {
  name: string;
  minWatts: number;
  maxWatts: number;
}

export interface CanonicalPowerZones {
  athleteId: string;
  ftpWatts: number;
  zones: PowerZoneDetail[];
  sourceMetadata: SourceMetadata;
  metadata: CanonicalMetadata;
}

export interface CanonicalTrainingSession {
  id: string; // sessions can aggregate activities on a single day
  athleteId: string;
  date: string; // YYYY-MM-DD
  durationSec: number;
  distanceMeters: number;
  activityIds: string[];
  sourceMetadata: SourceMetadata;
  metadata: CanonicalMetadata;
}
