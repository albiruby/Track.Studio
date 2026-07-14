import { IngestionRepository } from './repository';
import { CanonicalActivity } from '../canonical/types';

export class Deduplicator {
  /**
   * Generates a deterministic, collision-resistant hash of any JS value/object.
   * Useful for verifying payload identity regardless of minor formatting.
   */
  static computePayloadHash(data: any): string {
    const serialized = typeof data === 'string' 
      ? data 
      : JSON.stringify(data, Object.keys(data).sort()); // Sort keys for strict semantic determinism
    
    let hash = 5381;
    for (let i = 0; i < serialized.length; i++) {
      hash = (hash * 33) ^ serialized.charCodeAt(i);
    }
    
    // Return standard positive hex string
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  /**
   * Verifies if this payload has already been ingested in a prior cycle.
   */
  static async isPayloadDuplicate(userId: string, providerId: string, payload: any): Promise<boolean> {
    const hash = this.computePayloadHash(payload);
    return await IngestionRepository.isPayloadHashDuplicate(userId, providerId, hash);
  }

  /**
   * Verifies if a specific activity ID (external ID) already exists.
   */
  static async isActivityDuplicate(userId: string, providerId: string, externalId: string | number): Promise<boolean> {
    const cleanId = String(externalId);
    return await IngestionRepository.isExternalIdDuplicate(userId, providerId, cleanId);
  }

  /**
   * Performs multi-factor matching on an incoming activity against a list of existing activities.
   * Compares ID, start time, distance, duration, and GPS starting points.
   */
  static findDuplicate(
    incoming: CanonicalActivity,
    existing: CanonicalActivity[]
  ): { duplicate: CanonicalActivity; reason: string } | null {
    for (const cur of existing) {
      // 1. Match on Provider Activity ID (Direct check)
      if (
        incoming.externalProviderId === cur.externalProviderId &&
        incoming.sourceMetadata.providerObjectId === cur.sourceMetadata.providerObjectId
      ) {
        return { duplicate: cur, reason: `Provider ID Match: ${incoming.sourceMetadata.providerObjectId}` };
      }

      // 2. Match on Start Time, Elapsed Time, and Distance (within ±10 meters or ±2%)
      const isSameDay = incoming.startDate.slice(0, 10) === cur.startDate.slice(0, 10);
      const isSameTime = Math.abs(new Date(incoming.startDate).getTime() - new Date(cur.startDate).getTime()) < 60000; // ±1 minute
      const isSameDuration = Math.abs(incoming.elapsedTimeSec - cur.elapsedTimeSec) < 5; // ±5 seconds
      
      const distDiff = Math.abs(incoming.distanceMeters - cur.distanceMeters);
      const isSameDistance = distDiff < 10 || distDiff / (cur.distanceMeters || 1) < 0.02; // ±10 meters or ±2%

      if (isSameDay && isSameTime && isSameDuration && isSameDistance) {
        return { duplicate: cur, reason: 'Start Time, Elapsed Time, and Distance Match' };
      }

      // 3. Match on GPS Fingerprint (start & end coordinates within 10 meters / ~0.0001 degrees)
      if (incoming.startLatLng && cur.startLatLng && incoming.endLatLng && cur.endLatLng) {
        const startDiffLat = Math.abs(incoming.startLatLng[0] - cur.startLatLng[0]);
        const startDiffLng = Math.abs(incoming.startLatLng[1] - cur.startLatLng[1]);
        const endDiffLat = Math.abs(incoming.endLatLng[0] - cur.endLatLng[0]);
        const endDiffLng = Math.abs(incoming.endLatLng[1] - cur.endLatLng[1]);

        const degreeTolerance = 0.0001; // roughly 10 meters
        const isStartClose = startDiffLat < degreeTolerance && startDiffLng < degreeTolerance;
        const isEndClose = endDiffLat < degreeTolerance && endDiffLng < degreeTolerance;

        if (isStartClose && isEndClose && isSameDay) {
          return { duplicate: cur, reason: 'GPS Fingerprint (Start/End Location) and Date Match' };
        }
      }
    }

    return null;
  }
}
