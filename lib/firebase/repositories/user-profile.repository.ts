import { BaseRepository } from './base.repository';
import { UserProfile } from '../types';

export class UserProfileRepository extends BaseRepository<UserProfile> {
  constructor() {
    super('athleteProfiles');
  }

  /**
   * Helper to fetch or create a profile on successful authentication
   */
  async getOrCreateProfile(userId: string, initialData: Partial<UserProfile>): Promise<UserProfile> {
    const existing = await this.get(userId);
    if (existing) {
      return existing;
    }

    const newProfile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
      email: initialData.email || null,
      displayName: initialData.displayName || null,
      photoURL: initialData.photoURL || null,
      emailVerified: initialData.emailVerified || false,
      isAnonymous: initialData.isAnonymous || false,
      phoneNumber: initialData.phoneNumber || null,
      lastLoginAt: new Date().toISOString(),
    };

    return await this.create(userId, newProfile);
  }

  /**
   * Refreshes the last login date of a authenticated athlete
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.update(userId, {
      lastLoginAt: new Date().toISOString(),
    });
  }
}

// Single instance export for app-wide sharing
export const userProfileRepository = new UserProfileRepository();
