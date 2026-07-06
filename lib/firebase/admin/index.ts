import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getFirebaseAdminConfig } from '../config/env';

let adminApp: App | null = null;

/**
 * Lazily initializes and retrieves the Firebase Admin instance.
 * Throws a helpful, descriptive error if keys are missing.
 */
export function getFirebaseAdmin(): App {
  if (adminApp) {
    return adminApp;
  }

  const config = getFirebaseAdminConfig();
  if (!config) {
    throw new Error(
      'Firebase Admin credentials are not configured. Check FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY environment variables.'
    );
  }

  const existingApps = getApps();
  const defaultApp = existingApps.find((app) => app.name === '[DEFAULT]');
  if (defaultApp) {
    adminApp = defaultApp;
    return adminApp;
  }

  try {
    adminApp = initializeApp({
      credential: cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey,
      }),
    });
    return adminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

/**
 * Returns Admin Auth service
 */
export function getAdminAuth(): Auth {
  return getAuth(getFirebaseAdmin());
}

/**
 * Returns Admin Firestore service
 */
export function getAdminFirestore(): Firestore {
  return getFirestore(getFirebaseAdmin());
}

/**
 * Returns Admin Storage service
 */
export function getAdminStorage(): Storage {
  return getStorage(getFirebaseAdmin());
}
