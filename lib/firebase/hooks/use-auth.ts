import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/providers/firebase-provider';

/**
 * Enhanced hook exposing Auth, Session, and Client-side Guards
 */
export function useAuth() {
  const { user, profile, loading, isConfigured, error, loginWithGoogle, logout, updateProfileData } = useFirebase();
  const router = useRouter();

  /**
   * Client-side Route Guard. Enforces authentication and optionally redirects.
   */
  const enforceAuth = (redirectTo = '/login') => {
    useEffect(() => {
      if (!loading && !user && isConfigured) {
        router.push(redirectTo);
      }
    }, [user, loading, isConfigured, router, redirectTo]);
  };

  /**
   * Client-side Guest Guard. Enforces that logged-in users cannot access guest pages (e.g. login).
   */
  const enforceGuest = (redirectTo = '/') => {
    useEffect(() => {
      if (!loading && user && isConfigured) {
        router.push(redirectTo);
      }
    }, [user, loading, isConfigured, router, redirectTo]);
  };

  /**
   * Helper verifying if physiological markers are already registered (e.g., FTP, HR thresholds)
   */
  const hasPhysiologicalProfile = () => {
    if (!profile) return false;
    // Check if maxHeartRate, restingHeartRate, and functionalThresholdPace are set and non-zero
    const p = profile as any;
    return !!(
      p.maxHeartRate &&
      p.restingHeartRate &&
      p.functionalThresholdPace !== undefined &&
      p.functionalThresholdPace !== null
    );
  };

  return {
    user,
    profile,
    loading,
    isConfigured,
    error,
    isAuthenticated: !!user,
    hasProfile: !!profile,
    hasThresholds: hasPhysiologicalProfile(),
    loginWithGoogle,
    logout,
    updateProfileData,
    enforceAuth,
    enforceGuest,
  };
}
