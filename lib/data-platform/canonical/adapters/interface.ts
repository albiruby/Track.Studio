import { 
  CanonicalAthlete, 
  CanonicalActivity, 
  CanonicalLap, 
  CanonicalSplit, 
  CanonicalStream, 
  CanonicalGear, 
  CanonicalRoute,
  SourceMetadata
} from '../types';

export interface ProviderAdapter {
  providerId: 'strava' | 'intervals-icu';
  providerApiVersion: string;

  /**
   * Validates that the raw payload matches the expected provider schema for the specific dataType.
   */
  validatePayload(raw: any, dataType: 'athlete' | 'activities' | 'laps' | 'streams' | 'routes' | 'gear'): { valid: boolean; errors: string[] };

  /**
   * General mapping dispatcher based on dataType
   */
  mapToCanonical(
    raw: any, 
    dataType: 'athlete' | 'activities' | 'laps' | 'streams' | 'routes' | 'gear',
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): any;

  parseAthlete(
    raw: any, 
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): CanonicalAthlete;

  parseActivity(
    raw: any, 
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): CanonicalActivity;

  parseLap(
    raw: any, 
    activityId: string,
    lapIndex: number,
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): CanonicalLap;

  parseSplit(
    raw: any, 
    activityId: string,
    splitIndex: number,
    splitType: 'kilometer' | 'mile'
  ): CanonicalSplit;

  parseStream(
    raw: any, 
    activityId: string,
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): CanonicalStream;

  parseGear(
    raw: any, 
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): CanonicalGear;

  parseRoute(
    raw: any, 
    source: Omit<SourceMetadata, 'importedAt' | 'providerId' | 'providerApiVersion' | 'transformationVersion'>
  ): CanonicalRoute;
}
