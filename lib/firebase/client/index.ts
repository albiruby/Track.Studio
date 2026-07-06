import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFirebaseClientConfig } from '../config/env';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  const config = getFirebaseClientConfig();
  
  app = getApps().length === 0 ? initializeApp(config) : getApp();
  auth = getAuth(app);
  db = getFirestore(app, config.firestoreDatabaseId || '(default)');
  storage = getStorage(app);
} catch (error) {
  console.error('Failed to initialize client-side Firebase:', error);
  throw error;
}

export { app, auth, db, storage };
