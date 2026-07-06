import { 
  CanonicalActivity, 
  CanonicalAthlete, 
  CanonicalLap, 
  CanonicalSplit, 
  CanonicalStream, 
  CanonicalGear, 
  CanonicalRoute 
} from './types';

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  objectType: 'Athlete' | 'Activity' | 'Lap' | 'Split' | 'Stream' | 'Gear' | 'Route';
  id: string;
  timestamp: string;
}

export class ValidationEngine {
  /**
   * Validates a date string to ensure it is valid and parsed correctly.
   */
  private static isValidDate(dateStr: string | null | undefined): boolean {
    if (!dateStr) return false;
    const t = Date.parse(dateStr);
    return !isNaN(t);
  }

  /**
   * Validates coordinates are within legal GPS boundaries.
   */
  private static isValidLatLng(latlng: [number, number] | null | undefined): boolean {
    if (!latlng) return true; // Optional, so missing isn't invalid, but if present must be correct
    const [lat, lng] = latlng;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  /**
   * Validates a Canonical Athlete object.
   */
  static validateAthlete(athlete: CanonicalAthlete): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!athlete.id) errors.push('Missing athlete unique identifier (id)');
    if (!athlete.firstName) errors.push('Missing required athlete firstName');
    
    if (athlete.weightKg !== null && (athlete.weightKg <= 0 || athlete.weightKg > 500)) {
      errors.push(`Invalid weightKg: ${athlete.weightKg}. Must be between 0 and 500.`);
    }

    if (athlete.restingHeartRateBpm !== null && (athlete.restingHeartRateBpm < 25 || athlete.restingHeartRateBpm > 150)) {
      warnings.push(`Unusual restingHeartRateBpm: ${athlete.restingHeartRateBpm}`);
    }

    if (athlete.maxHeartRateBpm !== null && (athlete.maxHeartRateBpm < 80 || athlete.maxHeartRateBpm > 240)) {
      warnings.push(`Unusual maxHeartRateBpm: ${athlete.maxHeartRateBpm}`);
    }

    if (athlete.ftpWatts !== null && (athlete.ftpWatts < 0 || athlete.ftpWatts > 1000)) {
      errors.push(`Invalid ftpWatts: ${athlete.ftpWatts}. Must be positive and less than 1000 W.`);
    }

    if (!this.isValidDate(athlete.createdAt)) errors.push('Invalid or malformed createdAt timestamp');
    if (!this.isValidDate(athlete.updatedAt)) errors.push('Invalid or malformed updatedAt timestamp');

    // Source Metadata check
    if (!athlete.sourceMetadata?.providerId) errors.push('Missing source metadata providerId');
    if (!athlete.sourceMetadata?.providerObjectId) errors.push('Missing source metadata providerObjectId');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      objectType: 'Athlete',
      id: athlete.id || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validates a Canonical Activity.
   */
  static validateActivity(activity: CanonicalActivity): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    const activityId = activity.id || 'unknown';

    // 1. Missing IDs
    if (!activity.id) errors.push('Missing activity unique identifier (id)');
    if (!activity.athleteId) errors.push('Missing linked athlete identifier (athleteId)');
    if (!activity.providerObjectId) errors.push('Missing external provider object identifier (providerObjectId)');

    // 2. Invalid timestamps
    if (!this.isValidDate(activity.startDate)) errors.push('Invalid or malformed startDate timestamp');
    if (!activity.timezone) errors.push('Missing timezone identifier');

    // 3. Negative values
    if (activity.elapsedTimeSec < 0) errors.push('elapsedTimeSec cannot be negative');
    if (activity.movingTimeSec < 0) errors.push('movingTimeSec cannot be negative');
    if (activity.distanceMeters < 0) errors.push('distanceMeters cannot be negative');
    if (activity.averageSpeedMps < 0) errors.push('averageSpeedMps cannot be negative');
    if (activity.maximumSpeedMps < 0) errors.push('maximumSpeedMps cannot be negative');
    if (activity.elevationGainMeters < 0) errors.push('elevationGainMeters cannot be negative');
    if (activity.elevationLossMeters < 0) errors.push('elevationLossMeters cannot be negative');

    // 4. Invalid coordinates
    if (activity.location?.startLatLng && !this.isValidLatLng(activity.location.startLatLng)) {
      errors.push(`Invalid startLatLng coordinates: [${activity.location.startLatLng.join(', ')}]`);
    }
    if (activity.location?.endLatLng && !this.isValidLatLng(activity.location.endLatLng)) {
      errors.push(`Invalid endLatLng coordinates: [${activity.location.endLatLng.join(', ')}]`);
    }

    // 5. Unknown enums
    const validSports = ['running', 'trail_running', 'other'];
    if (!validSports.includes(activity.sportType)) {
      errors.push(`Unknown sportType: "${activity.sportType}". Allowed: ${validSports.join(', ')}`);
    }

    const validVisibilities = ['public', 'followers_only', 'only_me'];
    if (!validVisibilities.includes(activity.visibility)) {
      errors.push(`Unknown visibility: "${activity.visibility}". Allowed: ${validVisibilities.join(', ')}`);
    }

    // 6. Impossible durations
    if (activity.movingTimeSec > activity.elapsedTimeSec) {
      errors.push(`Impossible timing: movingTimeSec (${activity.movingTimeSec}) exceeds elapsedTimeSec (${activity.elapsedTimeSec})`);
    }
    if (activity.elapsedTimeSec > 172800) { // 48 hours
      warnings.push(`Activity duration is unusually long (${Math.round(activity.elapsedTimeSec / 3600)} hours)`);
    }

    // 7. Impossible distances & speeds
    if (activity.distanceMeters > 500000) { // 500km
      warnings.push(`Activity distance is extremely large (${Math.round(activity.distanceMeters / 1000)} km)`);
    }
    if (activity.maximumSpeedMps > 30) { // 30 m/s = 108 km/h (extremely fast for a runner)
      warnings.push(`Maximum speed of ${activity.maximumSpeedMps} m/s is extremely high for human performance`);
    }

    // 8. Corrupted structures & missing parameters
    if (!activity.location) errors.push('Missing location structure');
    if (!activity.elevation) errors.push('Missing elevation structure');
    if (!activity.device) errors.push('Missing device structure');
    if (!activity.sourceMetadata) errors.push('Missing sourceMetadata trace block');

    // 9. Heart Rate ranges check
    if (activity.averageHeartRateBpm !== null && (activity.averageHeartRateBpm < 30 || activity.averageHeartRateBpm > 230)) {
      errors.push(`Invalid averageHeartRateBpm: ${activity.averageHeartRateBpm}`);
    }
    if (activity.maxHeartRateBpm !== null && (activity.maxHeartRateBpm < 30 || activity.maxHeartRateBpm > 240)) {
      errors.push(`Invalid maxHeartRateBpm: ${activity.maxHeartRateBpm}`);
    }
    if (activity.averageHeartRateBpm && activity.maxHeartRateBpm && activity.averageHeartRateBpm > activity.maxHeartRateBpm) {
      errors.push('averageHeartRateBpm exceeds maxHeartRateBpm');
    }

    // Power ranges check
    if (activity.averagePowerWatts !== null && (activity.averagePowerWatts < 0 || activity.averagePowerWatts > 2000)) {
      errors.push(`Invalid averagePowerWatts: ${activity.averagePowerWatts}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      objectType: 'Activity',
      id: activityId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validates a Canonical Lap.
   */
  static validateLap(lap: CanonicalLap): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!lap.id) errors.push('Missing lap unique identifier (id)');
    if (!lap.activityId) errors.push('Missing parent activityId reference');
    if (typeof lap.lapIndex !== 'number' || lap.lapIndex < 0) errors.push('Invalid lapIndex');
    
    if (lap.elapsedTimeSec < 0) errors.push('elapsedTimeSec cannot be negative');
    if (lap.movingTimeSec < 0) errors.push('movingTimeSec cannot be negative');
    if (lap.distanceMeters < 0) errors.push('distanceMeters cannot be negative');

    if (lap.movingTimeSec > lap.elapsedTimeSec) {
      errors.push('movingTimeSec cannot exceed elapsedTimeSec');
    }

    if (!this.isValidDate(lap.startDate)) errors.push('Invalid startDate timestamp');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      objectType: 'Lap',
      id: lap.id || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validates a Canonical Split.
   */
  static validateSplit(split: CanonicalSplit): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!split.activityId) errors.push('Missing parent activityId reference');
    if (typeof split.splitIndex !== 'number' || split.splitIndex < 0) errors.push('Invalid splitIndex');
    if (split.distanceMeters < 0) errors.push('distanceMeters cannot be negative');
    if (split.elapsedTimeSec < 0) errors.push('elapsedTimeSec cannot be negative');
    if (split.movingTimeSec < 0) errors.push('movingTimeSec cannot be negative');

    if (split.splitType !== 'kilometer' && split.splitType !== 'mile') {
      errors.push(`Invalid splitType: "${split.splitType}". Must be 'kilometer' or 'mile'`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      objectType: 'Split',
      id: `split_${split.splitIndex}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validates a Canonical Stream.
   */
  static validateStream(stream: CanonicalStream): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!stream.activityId) errors.push('Missing parent activityId reference');
    if (!stream.timeSec || !Array.isArray(stream.timeSec) || stream.timeSec.length === 0) {
      errors.push('Missing or empty timeSec array stream');
    }

    const expectedLen = stream.timeSec ? stream.timeSec.length : 0;

    const checkLength = (arr: any[] | null, name: string) => {
      if (arr && arr.length !== expectedLen) {
        errors.push(`Mismatched stream size: "${name}" stream has size ${arr.length}, expected ${expectedLen}`);
      }
    };

    checkLength(stream.distanceMeters, 'distanceMeters');
    checkLength(stream.latlng, 'latlng');
    checkLength(stream.altitudeMeters, 'altitudeMeters');
    checkLength(stream.velocityMps, 'velocityMps');
    checkLength(stream.heartRateBpm, 'heartRateBpm');
    checkLength(stream.cadenceRpm, 'cadenceRpm');
    checkLength(stream.powerWatts, 'powerWatts');
    checkLength(stream.temperatureC, 'temperatureC');
    checkLength(stream.moving, 'moving');

    // Coordinate safety within streams
    if (stream.latlng) {
      for (let i = 0; i < stream.latlng.length; i++) {
        const pt = stream.latlng[i];
        if (pt && !this.isValidLatLng(pt)) {
          errors.push(`Invalid latlng coordinates at index ${i}: [${pt.join(', ')}]`);
          break; // Avoid spamming error list
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      objectType: 'Stream',
      id: `stream_${stream.activityId}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validates Canonical Gear / Shoes.
   */
  static validateGear(gear: CanonicalGear): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!gear.id) errors.push('Missing gear identifier (id)');
    if (!gear.athleteId) errors.push('Missing linked athleteId');
    if (!gear.name) errors.push('Missing gear display name');
    if (gear.distanceMeters < 0) errors.push('distanceMeters cannot be negative');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      objectType: 'Gear',
      id: gear.id || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validates Canonical Route.
   */
  static validateRoute(route: CanonicalRoute): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!route.id) errors.push('Missing route identifier (id)');
    if (!route.athleteId) errors.push('Missing linked athleteId');
    if (!route.name) errors.push('Missing route name');
    if (route.distanceMeters < 0) errors.push('distanceMeters cannot be negative');
    if (route.elevationGainMeters < 0) errors.push('elevationGainMeters cannot be negative');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      objectType: 'Route',
      id: route.id || 'unknown',
      timestamp: new Date().toISOString()
    };
  }
}
