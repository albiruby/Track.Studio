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

export class IntervalsAdapter implements ProviderAdapter {
  providerId: 'intervals-icu' = 'intervals-icu';
  providerApiVersion = 'v1';

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
      providerId: 'intervals-icu',
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
          if (!raw.id && !raw.athlete_id) errors.push('Missing athlete ID (id or athlete_id)');
          break;
        case 'activities':
          if (!raw.id) errors.push('Missing activity ID (id)');
          if (!raw.name) errors.push('Missing activity name (name)');
          if (!raw.start_date) errors.push('Missing start date (start_date)');
          break;
        case 'laps':
          // In Intervals, laps are often nested in the activity object under "ic_laps" or "laps"
          if (!raw.id && typeof raw.lap_index !== 'number') errors.push('Missing lap identifier (id or lap_index)');
          break;
        case 'streams':
          // Intervals.icu streams can come as an object { time: [...], distance: [...] }
          if (typeof raw !== 'object') {
            errors.push('Streams payload must be an object');
          } else {
            const hasTime = (Array.isArray(raw.time) || Array.isArray(raw.time_stream) || Array.isArray(raw.timeSec));
            if (!hasTime) errors.push('Missing time stream array in Intervals object');
          }
          break;
        case 'routes':
          if (!raw.id) errors.push('Missing route ID (id)');
          break;
        case 'gear':
          if (!raw.id) errors.push('Missing gear ID (id)');
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
      throw new Error(`Invalid Intervals.icu payload for ${dataType}: ${valResult.errors.join(', ')}`);
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
    const id = String(raw.id || raw.athlete_id);
    return {
      id: source.rawDocumentId.split('_')[0] || id,
      firstName: Normalizer.normalizeString(raw.name?.split(' ')[0] || raw.firstname, 'Unknown'),
      lastName: Normalizer.normalizeString(raw.name?.split(' ').slice(1).join(' ') || raw.lastname, ''),
      profileUrl: raw.profile || raw.avatar_url || null,
      gender: Normalizer.normalizeGender(raw.gender || raw.sex),
      weightKg: typeof raw.weight === 'number' && raw.weight > 0 ? raw.weight : null,
      restingHeartRateBpm: typeof raw.resting_hr === 'number' ? raw.resting_hr : null,
      maxHeartRateBpm: typeof raw.max_hr === 'number' ? raw.max_hr : null,
      ftpWatts: typeof raw.ftp === 'number' ? raw.ftp : null,
      vO2Max: typeof raw.vo2max === 'number' ? raw.vo2max : null,
      timezone: Normalizer.normalizeTimezone(raw.timezone || raw.timezone_id),
      createdAt: Normalizer.normalizeTimestamp(raw.created_at || new Date().toISOString()),
      updatedAt: Normalizer.normalizeTimestamp(raw.updated_at || new Date().toISOString()),
      sourceMetadata: this.getSourceMetadata(id, source),
      metadata: this.getMetadata(source)
    };
  }

  parseActivity(
    raw: any, 
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): CanonicalActivity {
    const athleteId = source.rawDocumentId.split('_')[0] || String(raw.athlete_id || 'unknown');
    const activityId = `intervals_${raw.id}`;

    // Normalize Location
    const location: any = {
      country: Normalizer.normalizeNullableString(raw.location_country || raw.country, null),
      state: Normalizer.normalizeNullableString(raw.location_state || raw.state, null),
      city: Normalizer.normalizeNullableString(raw.location_city || raw.city, null),
      startLatLng: Normalizer.normalizeLatLng(raw.start_latlng || raw.start_location),
      endLatLng: Normalizer.normalizeLatLng(raw.end_latlng || raw.end_location)
    };

    // Normalize Elevation
    const elevation: any = {
      gainMeters: typeof raw.total_elevation_gain === 'number' ? raw.total_elevation_gain : (typeof raw.elevation_gain === 'number' ? raw.elevation_gain : 0),
      lossMeters: typeof raw.total_elevation_loss === 'number' ? raw.total_elevation_loss : null,
      maxAltitudeMeters: typeof raw.max_altitude === 'number' ? raw.max_altitude : null,
      minAltitudeMeters: typeof raw.min_altitude === 'number' ? raw.min_altitude : null
    };

    // Normalize Device
    const device: any = {
      name: Normalizer.normalizeNullableString(raw.device_name || raw.source_name, null),
      serialNumber: Normalizer.normalizeNullableString(raw.device_serial_number, null),
      manufacturer: raw.device_name ? raw.device_name.split(' ')[0] : null
    };

    // Normalize Weather
    const weather: any = (typeof raw.temp === 'number' || typeof raw.average_temp === 'number') ? {
      temperatureC: typeof raw.temp === 'number' ? raw.temp : raw.average_temp,
      humidityPercent: typeof raw.humidity === 'number' ? raw.humidity : null,
      windSpeedMps: typeof raw.wind_speed === 'number' ? raw.wind_speed : null,
      windDirectionDeg: typeof raw.wind_dir === 'number' ? raw.wind_dir : null,
      summary: Normalizer.normalizeNullableString(raw.weather_summary || raw.weather, null),
      precipProbabilityPercent: typeof raw.precip_prob === 'number' ? raw.precip_prob : null
    } : null;

    // Convert speed (could be in mps or kph depending on payload)
    let avgSpeed = typeof raw.average_speed === 'number' ? raw.average_speed : 0;
    if (raw.speed_units === 'kph' && avgSpeed > 0) {
      avgSpeed = avgSpeed / 3.6; // Convert kph to mps
    }

    const distanceMeters = typeof raw.distance === 'number' ? raw.distance : 0;

    return {
      id: activityId,
      externalProviderId: 'intervals-icu',
      providerObjectId: String(raw.id),
      athleteId,
      activityName: Normalizer.normalizeString(raw.name, 'Intervals.icu Activity'),
      sportType: Normalizer.normalizeSportType(raw.type),
      startDate: Normalizer.normalizeTimestamp(raw.start_date),
      timezone: Normalizer.normalizeTimezone(raw.timezone || 'UTC'),
      elapsedTimeSec: typeof raw.elapsed_time === 'number' ? raw.elapsed_time : 0,
      movingTimeSec: typeof raw.moving_time === 'number' ? raw.moving_time : 0,
      distanceMeters,
      averagePaceMinPerKm: Normalizer.mpsToPaceMinPerKm(avgSpeed),
      averageSpeedMps: avgSpeed,
      maximumSpeedMps: typeof raw.max_speed === 'number' ? raw.max_speed : 0,
      elevationGainMeters: elevation.gainMeters,
      elevationLossMeters: elevation.lossMeters || 0,
      averageHeartRateBpm: Normalizer.normalizeHeartRate(raw.average_heartrate || raw.avg_hr),
      maxHeartRateBpm: Normalizer.normalizeHeartRate(raw.max_heartrate || raw.max_hr),
      averageCadenceRpm: Normalizer.normalizeCadence(raw.average_cadence || raw.avg_cadence),
      maxCadenceRpm: Normalizer.normalizeCadence(raw.max_cadence),
      averagePowerWatts: Normalizer.normalizePower(raw.average_watts || raw.avg_watts),
      maxPowerWatts: Normalizer.normalizePower(raw.max_watts),
      calories: typeof raw.calories === 'number' ? raw.calories : null,
      device,
      shoesId: raw.gear_id ? `intervals_gear_${raw.gear_id}` : null,
      gpsPolyline: raw.map_polyline || raw.summary_polyline || null,
      visibility: raw.private ? 'only_me' : 'public',
      privateFlag: !!raw.private,
      manualFlag: !!raw.manual,
      commuteFlag: !!raw.commute,
      trainerFlag: !!raw.trainer,
      kilojoules: typeof raw.kilojoules === 'number' ? raw.kilojoules : null,
      weather,
      location,
      elevation,
      achievements: [],
      bestEfforts: [],
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
    const lapId = `intervals_lap_${raw.id || lapIndex}`;
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
      maxPowerWatts: typeof raw.max_watts === 'number' ? raw.max_watts : null,
      elevationGainMeters: typeof raw.elevation_gain === 'number' ? raw.elevation_gain : null,
      elevationLossMeters: typeof raw.elevation_loss === 'number' ? raw.elevation_loss : null,
      startDate: Normalizer.normalizeTimestamp(raw.start_date || new Date().toISOString()),
      startIndex: typeof raw.start_index === 'number' ? raw.start_index : null,
      endIndex: typeof raw.end_index === 'number' ? raw.end_index : null,
      sourceMetadata: this.getSourceMetadata(raw.id || `lap_${lapIndex}`, source),
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
    raw: any, // Raw is expected to be the Intervals stream object { time: [...], distance: [...] }
    activityId: string,
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): CanonicalStream {
    if (typeof raw !== 'object' || raw === null) {
      throw new Error('Intervals streams raw payload must be an object.');
    }

    const streamTypes = Object.keys(raw);

    const timeSec = raw.time || raw.time_stream || raw.timeSec || [];
    const distanceMeters = raw.distance || raw.distance_stream || null;
    const latlng = raw.latlng || raw.location || null;
    const altitudeMeters = raw.altitude || raw.altitude_stream || null;
    const velocityMps = raw.velocity || raw.velocity_stream || null;
    const heartRateBpm = raw.heartrate || raw.heart_rate || null;
    const cadenceRpm = raw.cadence || null;
    const powerWatts = raw.watts || raw.power || null;
    const temperatureC = raw.temp || raw.temperature || null;
    const moving = raw.moving || null;

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
      id: `intervals_gear_${raw.id}`,
      athleteId,
      name: Normalizer.normalizeString(raw.name, 'Intervals Shoe'),
      brandName: Normalizer.normalizeNullableString(raw.brand, null),
      modelName: Normalizer.normalizeNullableString(raw.model, null),
      distanceMeters: typeof raw.distance === 'number' ? raw.distance : 0,
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
    const athleteId = source.rawDocumentId.split('_')[0] || 'unknown';
    return {
      id: `intervals_route_${raw.id}`,
      athleteId,
      name: Normalizer.normalizeString(raw.name, 'Intervals Route'),
      description: Normalizer.normalizeNullableString(raw.description, null),
      distanceMeters: typeof raw.distance === 'number' ? raw.distance : 0,
      elevationGainMeters: typeof raw.elevation_gain === 'number' ? raw.elevation_gain : 0,
      mapPolyline: raw.map_polyline || null,
      sportType: raw.type === 'Run' ? 'running' : 'other',
      createdAt: Normalizer.normalizeTimestamp(raw.created_at || new Date().toISOString()),
      sourceMetadata: this.getSourceMetadata(raw.id, source),
      metadata: this.getMetadata(source)
    };
  }
}
