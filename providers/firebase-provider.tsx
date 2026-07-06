'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { userProfileRepository } from '@/lib/firebase/repositories/user-profile.repository';
import { UserProfile, SessionState } from '@/lib/firebase/types';

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  profile: null,
  loading: true,
  isConfigured: false,
  error: null,
  loginWithGoogle: async () => {},
  logout: async () => {},
  updateProfileData: async () => {},
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setSession((prev) => ({ ...prev, loading: false }));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setSession({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });
        return;
      }

      setSession((prev) => ({ ...prev, user: currentUser, loading: true }));

      try {
        // Automatically sync & fetch user profile in Firestore
        const profile = await userProfileRepository.getOrCreateProfile(currentUser.uid, {
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          emailVerified: currentUser.emailVerified,
          isAnonymous: currentUser.isAnonymous,
          phoneNumber: currentUser.phoneNumber,
        });

        // Trigger updating the last login time
        await userProfileRepository.updateLastLogin(currentUser.uid);

        setSession({
          user: currentUser,
          profile,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error('Failed to sync authenticated user profile document:', err);
        // Fallback to authenticated state but with error profile
        setSession({
          user: currentUser,
          profile: null,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      console.warn('Firebase is not yet configured. Please run set_up_firebase first.');
      return;
    }
    const provider = new GoogleAuthProvider();
    setSession((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Authentication Error:', error);
      setSession((prev) => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : String(error) 
      }));
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured) return;
    setSession((prev) => ({ ...prev, loading: true }));
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign Out Error:', error);
      setSession((prev) => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : String(error) 
      }));
    }
  };

  const updateProfileData = async (data: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!session.user) {
      throw new Error('Unauthenticated user attempt to modify profile');
    }
    try {
      await userProfileRepository.update(session.user.uid, data);
      setSession((prev) => {
        if (!prev.profile) return prev;
        return {
          ...prev,
          profile: {
            ...prev.profile,
            ...data,
            updatedAt: new Date().toISOString()
          }
        };
      });
    } catch (error: any) {
      console.error('Failed to update athlete profile:', error);
      throw error;
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user: session.user,
        profile: session.profile,
        loading: session.loading,
        isConfigured: isFirebaseConfigured,
        error: session.error,
        loginWithGoogle,
        logout,
        updateProfileData,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}
