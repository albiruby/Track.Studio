import { ProviderAdapter } from './interface';
import { Normalizer } from '../normalizer';
import { 
  CanonicalAthlete, 
  CanonicalActivity, 
  CanonicalLap, 
  CanonicalSplit, 
  CanonicalStream, 
  CanonicalGear, 
  CanonicalRoute,
  SourceMetadata,
  CanonicalMetadata
} from '../types';

export class StravaAdapter implements ProviderAdapter {
  providerId: 'strava' = 'strava';
  providerApiVersion = 'v3';

  private getMetadata(source: any): CanonicalMetadata {
    return {
      schemaVersion: '1.0.0',
      importedAt: new Date().toISOString(),
      transformationVersion: '1.0.0'
    };
  }

  private getSourceMetadata(
    rawId: string, 
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): SourceMetadata {
    return {
      providerId: 'strava',
      providerObjectId: String(rawId),
      rawDocumentId: source.rawDocumentId,
      syncJobId: source.syncJobId,
      apiEndpoint: source.apiEndpoint,
      payloadHash: source.payloadHash,
      providerApiVersion: this.providerApiVersion,
      transformationVersion: '1.0.0',
      importedAt: new Date().toISOString()
    };
  }

  validatePayload(raw: any, dataType: 'athlete' | 'activities' | 'laps' | 'streams' | 'routes' | 'gear'): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!raw) {
      return { valid: false, errors: ['Payload is empty or null'] };
    }

    try {
      switch (dataType) {
        case 'athlete':
          if (!raw.id) errors.push('Missing athlete ID (id)');
          break;
        case 'activities':
          if (!raw.id) errors.push('Missing activity ID (id)');
          if (!raw.name) errors.push('Missing activity name (name)');
          if (!raw.start_date) errors.push('Missing start date (start_date)');
          break;
        case 'laps':
          if (!raw.id) errors.push('Missing lap ID (id)');
          if (!raw.activity?.id && !raw.activity_id) errors.push('Missing linked activity reference');
          break;
        case 'streams':
          if (!Array.isArray(raw)) {
            errors.push('Streams payload must be an array of stream objects');
          } else {
            const hasTime = raw.some((s: any) => s.type === 'time');
            if (!hasTime) errors.push('Missing critical "time" stream type');
          }
          break;
        case 'routes':
          if (!raw.id) errors.push('Missing route ID (id)');
          if (!raw.name) errors.push('Missing route name (name)');
          break;
        case 'gear':
          if (!raw.id) errors.push('Missing gear ID (id)');
          if (!raw.name) errors.push('Missing gear name (name)');
          break;
        default:
          errors.push(`Unknown data type: ${dataType}`);
      }
    } catch (e: any) {
      errors.push(`Validation threw an exception: ${e.message}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  mapToCanonical(
    raw: any, 
    dataType: 'athlete' | 'activities' | 'laps' | 'streams' | 'routes' | 'gear',
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): any {
    const valResult = this.validatePayload(raw, dataType);
    if (!valResult.valid) {
      throw new Error(`Invalid Strava payload for ${dataType}: ${valResult.errors.join(', ')}`);
    }

    switch (dataType) {
      case 'athlete':
        return this.parseAthlete(raw, source);
      case 'activities':
        return this.parseActivity(raw, source);
      case 'streams':
        return this.parseStream(raw, 'unknown_activity_id', source);
      case 'gear':
        return this.parseGear(raw, source);
      case 'routes':
        return this.parseRoute(raw, source);
      default:
        throw new Error(`Mapping not implemented for data type: ${dataType}`);
    }
  }

  parseAthlete(
    raw: any, 
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): CanonicalAthlete {
    const athleteId = String(raw.id);
    return {
      id: source.rawDocumentId.split('_')[0] || athleteId, // Use user ID from rawDocumentId (format: userId_providerId) if available
      firstName: Normalizer.normalizeString(raw.firstname, 'Unknown'),
      lastName: Normalizer.normalizeString(raw.lastname, ''),
      profileUrl: raw.profile || null,
      gender: Normalizer.normalizeGender(raw.sex),
      weightKg: typeof raw.weight === 'number' && raw.weight > 0 ? raw.weight : null,
      restingHeartRateBpm: null, // Strava doesn't supply resting heart rate directly in athlete model
      maxHeartRateBpm: null,
      ftpWatts: typeof raw.ftp === 'number' && raw.ftp > 0 ? raw.ftp : null,
      vO2Max: null,
      timezone: Normalizer.normalizeTimezone(raw.measurement_preference), // or default
      createdAt: Normalizer.normalizeTimestamp(raw.created_at),
      updatedAt: Normalizer.normalizeTimestamp(raw.updated_at),
      sourceMetadata: this.getSourceMetadata(raw.id, source),
      metadata: this.getMetadata(source)
    };
  }

  parseActivity(
    raw: any, 
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): CanonicalActivity {
    const athleteId = source.rawDocumentId.split('_')[0] || String(raw.athlete?.id || 'unknown');
    const activityId = `strava_${raw.id}`;

    // Normalize Location
    const location: any = {
      country: Normalizer.normalizeNullableString(raw.location_country, null),
      state: Normalizer.normalizeNullableString(raw.location_state, null),
      city: Normalizer.normalizeNullableString(raw.location_city, null),
      startLatLng: Normalizer.normalizeLatLng(raw.start_latlng),
      endLatLng: Normalizer.normalizeLatLng(raw.end_latlng)
    };

    // Normalize Elevation
    const elevation: any = {
      gainMeters: typeof raw.total_elevation_gain === 'number' ? raw.total_elevation_gain : 0,
      lossMeters: typeof raw.elev_low === 'number' && typeof raw.elev_high === 'number' ? (raw.elev_high - raw.elev_low) : null,
      maxAltitudeMeters: typeof raw.elev_high === 'number' ? raw.elev_high : null,
      minAltitudeMeters: typeof raw.elev_low === 'number' ? raw.elev_low : null
    };

    // Normalize Device
    const device: any = {
      name: Normalizer.normalizeNullableString(raw.device_name, null),
      serialNumber: null,
      manufacturer: raw.device_name ? raw.device_name.split(' ')[0] : null
    };

    // Normalize Weather (from average temp)
    const weather: any = (typeof raw.average_temp === 'number') ? {
      temperatureC: raw.average_temp,
      humidityPercent: null,
      windSpeedMps: null,
      windDirectionDeg: null,
      summary: null,
      precipProbabilityPercent: null
    } : null;

    // Parse achievements
    const achievements: any[] = [];
    if (raw.achievement_count && raw.achievement_count > 0) {
      achievements.push({
        name: `${raw.achievement_count} PR/Segment Achievements`,
        description: `User earned ${raw.achievement_count} achievements during this run.`,
        rank: 1,
        type: 'Segment_KOM'
      });
    }

    // Parse splits
    const bestEfforts: any[] = [];
    if (Array.isArray(raw.best_efforts)) {
      raw.best_efforts.forEach((be: any) => {
        bestEfforts.push({
          name: Normalizer.normalizeString(be.name, 'Best Effort'),
          distanceMeters: typeof be.distance === 'number' ? be.distance : 0,
          elapsedTimeSec: typeof be.elapsed_time === 'number' ? be.elapsed_time : 0,
          movingTimeSec: typeof be.moving_time === 'number' ? be.moving_time : 0,
          startIndex: typeof be.start_index === 'number' ? be.start_index : null,
          endIndex: typeof be.end_index === 'number' ? be.end_index : null
        });
      });
    }

    const avgSpeed = typeof raw.average_speed === 'number' ? raw.average_speed : 0;

    return {
      id: activityId,
      externalProviderId: 'strava',
      providerObjectId: String(raw.id),
      athleteId,
      activityName: Normalizer.normalizeString(raw.name, 'Strava Run'),
      sportType: Normalizer.normalizeSportType(raw.sport_type || raw.type),
      startDate: Normalizer.normalizeTimestamp(raw.start_date),
      timezone: Normalizer.normalizeTimezone(raw.timezone?.replace(/\(GMT.*?\)\s*/g, '') || 'UTC'),
      elapsedTimeSec: typeof raw.elapsed_time === 'number' ? raw.elapsed_time : 0,
      movingTimeSec: typeof raw.moving_time === 'number' ? raw.moving_time : 0,
      distanceMeters: typeof raw.distance === 'number' ? raw.distance : 0,
      averagePaceMinPerKm: Normalizer.mpsToPaceMinPerKm(avgSpeed),
      averageSpeedMps: avgSpeed,
      maximumSpeedMps: typeof raw.max_speed === 'number' ? raw.max_speed : 0,
      elevationGainMeters: elevation.gainMeters,
      elevationLossMeters: elevation.lossMeters || 0,
      averageHeartRateBpm: Normalizer.normalizeHeartRate(raw.average_heartrate),
      maxHeartRateBpm: Normalizer.normalizeHeartRate(raw.max_heartrate),
      averageCadenceRpm: Normalizer.normalizeCadence(raw.average_cadence),
      maxCadenceRpm: null, // Strava summary doesn't supply max cadence directly
      averagePowerWatts: Normalizer.normalizePower(raw.average_watts),
      maxPowerWatts: Normalizer.normalizePower(raw.max_watts),
      calories: typeof raw.calories === 'number' ? raw.calories : null,
      device,
      shoesId: raw.gear_id ? `strava_gear_${raw.gear_id}` : null,
      gpsPolyline: raw.map?.summary_polyline || null,
      visibility: Normalizer.normalizeVisibility(raw.visibility),
      privateFlag: !!raw.private,
      manualFlag: !!raw.manual,
      commuteFlag: !!raw.commute,
      trainerFlag: !!raw.trainer,
      kilojoules: typeof raw.kilojoules === 'number' ? raw.kilojoules : null,
      weather,
      location,
      elevation,
      achievements,
      bestEfforts,
      sourceMetadata: this.getSourceMetadata(raw.id, source),
      metadata: this.getMetadata(source),
      createdAt: Normalizer.normalizeTimestamp(raw.start_date),
      updatedAt: new Date().toISOString()
    };
  }

  parseLap(
    raw: any, 
    activityId: string,
    lapIndex: number,
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): CanonicalLap {
    const lapId = `strava_lap_${raw.id}`;
    return {
      id: lapId,
      activityId,
      lapIndex,
      name: Normalizer.normalizeString(raw.name, `Lap ${lapIndex}`),
      elapsedTimeSec: typeof raw.elapsed_time === 'number' ? raw.elapsed_time : 0,
      movingTimeSec: typeof raw.moving_time === 'number' ? raw.moving_time : 0,
      distanceMeters: typeof raw.distance === 'number' ? raw.distance : 0,
      averageSpeedMps: typeof raw.average_speed === 'number' ? raw.average_speed : 0,
      maxSpeedMps: typeof raw.max_speed === 'number' ? raw.max_speed : 0,
      averageHeartRateBpm: Normalizer.normalizeHeartRate(raw.average_heartrate),
      maxHeartRateBpm: Normalizer.normalizeHeartRate(raw.max_heartrate),
      averageCadenceRpm: Normalizer.normalizeCadence(raw.average_cadence),
      averagePowerWatts: Normalizer.normalizePower(raw.average_watts),
      maxPowerWatts: null,
      elevationGainMeters: typeof raw.total_elevation_gain === 'number' ? raw.total_elevation_gain : null,
      elevationLossMeters: null,
      startDate: Normalizer.normalizeTimestamp(raw.start_date),
      startIndex: typeof raw.start_index === 'number' ? raw.start_index : null,
      endIndex: typeof raw.end_index === 'number' ? raw.end_index : null,
      sourceMetadata: this.getSourceMetadata(raw.id, source),
      metadata: this.getMetadata(source)
    };
  }

  parseSplit(
    raw: any, 
    activityId: string,
    splitIndex: number,
    splitType: 'kilometer' | 'mile'
  ): CanonicalSplit {
    return {
      activityId,
      splitIndex,
      distanceMeters: typeof raw.distance === 'number' ? raw.distance : 0,
      elapsedTimeSec: typeof raw.elapsed_time === 'number' ? raw.elapsed_time : 0,
      movingTimeSec: typeof raw.moving_time === 'number' ? raw.moving_time : 0,
      elevationDifferenceMeters: typeof raw.elevation_difference === 'number' ? raw.elevation_difference : null,
      averageSpeedMps: typeof raw.average_speed === 'number' ? raw.average_speed : 0,
      averageHeartRateBpm: Normalizer.normalizeHeartRate(raw.average_heartrate),
      averageCadenceRpm: Normalizer.normalizeCadence(raw.average_cadence),
      averagePowerWatts: Normalizer.normalizePower(raw.average_watts),
      splitType
    };
  }

  parseStream(
    raw: any, // Raw is expected to be the Strava Stream array response
    activityId: string,
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): CanonicalStream {
    if (!Array.isArray(raw)) {
      throw new Error('Strava streams raw payload must be an array.');
    }

    const streamTypes = raw.map((s: any) => String(s.type));
    
    // Locate each stream type
    const findData = (type: string) => {
      const found = raw.find((s: any) => s.type === type);
      return found ? found.data : null;
    };

    const timeSec = findData('time') || [];
    const distanceMeters = findData('distance');
    const latlng = findData('latlng');
    const altitudeMeters = findData('altitude');
    const velocityMps = findData('velocity_smooth');
    const heartRateBpm = findData('heartrate');
    const cadenceRpm = findData('cadence');
    const powerWatts = findData('watts');
    const temperatureC = findData('temp');
    const moving = findData('moving');

    // Normalize coordinates in latlng array if present
    const normalizedLatLng: [number, number][] | null = latlng ? latlng.map((pt: any) => {
      if (Array.isArray(pt) && pt.length >= 2) {
        return [
          Normalizer.normalizeCoordinate(pt[0]),
          Normalizer.normalizeCoordinate(pt[1])
        ];
      }
      return [0, 0];
    }) : null;

    return {
      activityId,
      streamTypes,
      timeSec,
      distanceMeters,
      latlng: normalizedLatLng,
      altitudeMeters,
      velocityMps,
      heartRateBpm: heartRateBpm ? heartRateBpm.map((hr: number) => Normalizer.normalizeHeartRate(hr) || 0) : null,
      cadenceRpm: cadenceRpm ? cadenceRpm.map((c: number) => Normalizer.normalizeCadence(c) || 0) : null,
      powerWatts: powerWatts ? powerWatts.map((p: number) => Normalizer.normalizePower(p) || 0) : null,
      temperatureC,
      moving,
      sourceMetadata: this.getSourceMetadata('streams_' + activityId, source),
      metadata: this.getMetadata(source)
    };
  }

  parseGear(
    raw: any, 
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): CanonicalGear {
    const athleteId = source.rawDocumentId.split('_')[0] || 'unknown';
    return {
      id: `strava_gear_${raw.id}`,
      athleteId,
      name: Normalizer.normalizeString(raw.name, 'Strava Shoe'),
      brandName: Normalizer.normalizeNullableString(raw.brand_name, null),
      modelName: Normalizer.normalizeNullableString(raw.model_name, null),
      distanceMeters: typeof raw.converted_distance === 'number' ? raw.converted_distance : (typeof raw.distance === 'number' ? raw.distance : 0),
      isPrimary: !!raw.primary,
      description: Normalizer.normalizeNullableString(raw.description, null),
      retired: !!raw.retired,
      type: 'shoes',
      sourceMetadata: this.getSourceMetadata(raw.id, source),
      metadata: this.getMetadata(source)
    };
  }

  parseRoute(
    raw: any, 
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): CanonicalRoute {
    const athleteId = source.rawDocumentId.split('_')[0] || String(raw.athlete?.id || 'unknown');
    return {
      id: `strava_route_${raw.id}`,
      athleteId,
      name: Normalizer.normalizeString(raw.name, 'Strava Route'),
      description: Normalizer.normalizeNullableString(raw.description, null),
      distanceMeters: typeof raw.distance === 'number' ? raw.distance : 0,
      elevationGainMeters: typeof raw.elevation_gain === 'number' ? raw.elevation_gain : 0,
      mapPolyline: raw.map?.summary_polyline || null,
      sportType: raw.type === 1 ? 'running' : 'other', // Strava route types
      createdAt: Normalizer.normalizeTimestamp(raw.created_at),
      sourceMetadata: this.getSourceMetadata(raw.id, source),
      metadata: this.getMetadata(source)
    };
  }
}
