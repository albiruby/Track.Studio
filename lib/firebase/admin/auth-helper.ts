import { NextRequest } from 'next/server';
import { getAdminAuth } from './index';

export interface DecodedAuthToken {
  uid: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

/**
 * Parses the Authorization header and verifies the Firebase ID Token.
 * Returns the decoded token or throws an error if unauthenticated.
 */
export async function verifySessionToken(req: NextRequest): Promise<DecodedAuthToken> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.substring(7);

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: !!decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
  } catch (error) {
    console.error('Failed to verify Firebase Session Token:', error);
    throw new Error('Unauthorized');
  }
}

/**
 * Safely parses cookie-based sessions for page layouts if configured
 */
export async function verifyCookieToken(token: string): Promise<DecodedAuthToken | null> {
  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: !!decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
  } catch {
    return null;
  }
}
