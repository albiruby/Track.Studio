import appletConfig from '../../../firebase-applet-config.json';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
}

export interface FirebaseAdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

/**
 * Checks if the required client config properties are loaded
 */
function isConfigValid(config: Partial<FirebaseClientConfig>): config is FirebaseClientConfig {
  return !!(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.storageBucket &&
    config.messagingSenderId &&
    config.appId
  );
}

/**
 * Retrieves the client configuration, prioritising system environment variables
 * and falling back to the workspace applet configuration.
 */
export function getFirebaseClientConfig(): FirebaseClientConfig {
  const envConfig: Partial<FirebaseClientConfig> = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // If environment variables are complete, use them
  if (isConfigValid(envConfig)) {
    return envConfig;
  }

  // Fallback to applet config
  const fallbackConfig: FirebaseClientConfig = {
    apiKey: appletConfig.apiKey,
    authDomain: appletConfig.authDomain,
    projectId: appletConfig.projectId,
    storageBucket: appletConfig.storageBucket,
    messagingSenderId: appletConfig.messagingSenderId,
    appId: appletConfig.appId,
    firestoreDatabaseId: appletConfig.firestoreDatabaseId,
  };

  if (isConfigValid(fallbackConfig)) {
    return fallbackConfig;
  }

  throw new Error(
    'Firebase Client Configuration is incomplete. Ensure env variables are configured or firebase-applet-config.json is present.'
  );
}

/**
 * Safely fetches the server-only Firebase Admin configuration.
 * Always validates keys to prevent module crash during load.
 */
export function getFirebaseAdminConfig(): FirebaseAdminConfig | null {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  // Handle formatted private key strings with raw newlines
  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  return {
    projectId,
    clientEmail,
    privateKey: formattedPrivateKey,
  };
}
