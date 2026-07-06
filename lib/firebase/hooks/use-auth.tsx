'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirebaseAuth } from '../config';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';

export interface AthleteProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  vo2Max?: number;
  weightKg?: number;
  ftpWatts?: number;
}

interface AuthContextType {
  user: AthleteProfile | null;
  loading: boolean;
  isConfigured: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setIsConfigured(false);
      setUser(null);
      setLoading(false);
      return;
    }

    setIsConfigured(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Athlete User',
          photoURL: firebaseUser.photoURL || 'https://picsum.photos/seed/default_avatar/150/150',
          vo2Max: 58.4,
          weightKg: 68.5,
          ftpWatts: 295,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Authentication service is not configured on this server.');
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Google Auth login popup
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Auth Failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isConfigured, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
