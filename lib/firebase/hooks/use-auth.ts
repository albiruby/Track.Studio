'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, FirebaseProvider } from '@/providers/firebase-provider';

export { FirebaseProvider as AuthProvider };

/**
 * Standard hook for checking auth, session, and physiological markers
 */
export function useAuth() {
  const { user, profile, loading, isConfigured, error, loginWithGoogle, logout, updateProfileData } = useFirebase();
  const router = useRouter();

  /**
   * Client-side Route Guard. Enforces authentication and optionally redirects.
   * Defined safely without nested hooks.
   */
  const enforceAuth = (redirectTo = '/login') => {
    if (!loading && !user && isConfigured) {
      router.push(redirectTo);
    }
  };

  /**
   * Client-side Guest Guard. Enforces that logged-in users cannot access guest pages (e.g. login).
   * Defined safely without nested hooks.
   */
  const enforceGuest = (redirectTo = '/') => {
    if (!loading && user && isConfigured) {
      router.push(redirectTo);
    }
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

/**
 * Standalone Client-side Route Guard custom hook. Enforces authentication and redirects on state changes.
 */
export function useEnforceAuth(redirectTo = '/login') {
  const { user, loading, isConfigured } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && isConfigured) {
      router.push(redirectTo);
    }
  }, [user, loading, isConfigured, router, redirectTo]);
}

/**
 * Standalone Client-side Guest Guard custom hook. Enforces that logged-in users cannot access guest pages.
 */
export function useEnforceGuest(redirectTo = '/') {
  const { user, loading, isConfigured } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && isConfigured) {
      router.push(redirectTo);
    }
  }, [user, loading, isConfigured, router, redirectTo]);
}
