import { IngestionRepository } from './repository';

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
}
