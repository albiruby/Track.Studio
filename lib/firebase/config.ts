import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ai-studio-trackstudio-3ea5c50e-933c-4eec-8bc8-6a754663ef5c',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy initialization pattern to prevent crash when keys are missing during builds
let app: any;
let auth: any = null;
let db: any = null;

export function getFirebaseApp() {
  if (!app) {
    if (getApps().length > 0) {
      app = getApp();
    } else {
      // If config is missing basic details, we can still initialize or mock
      app = initializeApp(firebaseConfig);
    }
  }
  return app;
}

export function getFirebaseAuth() {
  if (!auth) {
    const appInstance = getFirebaseApp();
    try {
      auth = getAuth(appInstance);
    } catch (e) {
      console.warn("Firebase Auth failed to initialize", e);
    }
  }
  return auth;
}

export function getFirebaseFirestore() {
  if (!db) {
    const appInstance = getFirebaseApp();
    try {
      db = getFirestore(appInstance);
    } catch (e) {
      console.warn("Firebase Firestore failed to initialize", e);
    }
  }
  return db;
}
