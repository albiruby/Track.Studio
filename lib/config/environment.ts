const isServer = typeof window === 'undefined';

export interface StravaConfig {
  clientId: string | undefined;
  clientSecret: string | undefined;
  websiteUrl: string | undefined;
  redirectUri: string | undefined;
  apiBaseUrl: string;
  oauthUrl: string;
  isValid: boolean;
}

export interface IntervalsConfig {
  athleteId: string | undefined;
  apiKey: string | undefined;
  apiBaseUrl: string;
  isValid: boolean;
}

export interface AppConfig {
  url: string;
  nodeEnv: string;
}

export interface EnvironmentConfig {
  strava: StravaConfig;
  intervals: IntervalsConfig;
  app: AppConfig;
}

const stravaClientId = process.env.STRAVA_CLIENT_ID;
const stravaClientSecret = process.env.STRAVA_CLIENT_SECRET;
const stravaRedirectUri = process.env.STRAVA_REDIRECT_URI;
const stravaWebsiteUrl = process.env.STRAVA_WEBSITE_URL;
const stravaApiBaseUrl = process.env.STRAVA_API_BASE_URL || 'https://www.strava.com/api/v3';
const stravaOauthUrl = process.env.STRAVA_OAUTH_URL || 'https://www.strava.com/oauth';

const intervalsAthleteId = process.env.INTERVALS_ATHLETE_ID;
const intervalsApiKey = process.env.INTERVALS_API_KEY;
const intervalsApiBaseUrl = process.env.INTERVALS_API_BASE_URL || 'https://intervals.icu/api/v1';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
const nodeEnv = process.env.NODE_ENV || 'development';

const hasStrava = !!stravaClientId && !!stravaClientSecret && !!stravaRedirectUri;
const hasIntervals = !!intervalsAthleteId && !!intervalsApiKey;

export const environment: EnvironmentConfig = {
  strava: Object.freeze({
    clientId: stravaClientId,
    clientSecret: isServer ? stravaClientSecret : undefined,
    websiteUrl: stravaWebsiteUrl,
    redirectUri: stravaRedirectUri,
    apiBaseUrl: stravaApiBaseUrl,
    oauthUrl: stravaOauthUrl,
    isValid: hasStrava,
  }),
  intervals: Object.freeze({
    athleteId: intervalsAthleteId,
    apiKey: isServer ? intervalsApiKey : undefined,
    apiBaseUrl: intervalsApiBaseUrl,
    isValid: hasIntervals,
  }),
  app: Object.freeze({
    url: appUrl,
    nodeEnv: nodeEnv,
  }),
};

if (isServer) {
  if (hasStrava) {
    console.log('✔ Strava configuration loaded');
    if (stravaRedirectUri?.includes('/api/integrations/strava/callback')) {
      console.log('✔ OAuth redirect validated');
    }
  } else {
    console.warn('⚠ Strava configuration is incomplete');
  }

  if (hasIntervals) {
    console.log('✔ Intervals configuration loaded');
    console.log('✔ API credentials detected');
  } else {
    console.warn('⚠ Intervals configuration is incomplete');
  }
}

export function assertStravaConfigured(): void {
  if (!isServer) return;
  if (!environment.strava.isValid) {
    throw new Error(
      'Strava configuration error: Missing required environment variables ([STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI]).'
    );
  }
}

export function assertIntervalsConfigured(): void {
  if (!isServer) return;
  if (!environment.intervals.isValid) {
    throw new Error(
      'Intervals.icu configuration error: Missing required environment variables ([INTERVALS_ATHLETE_ID, INTERVALS_API_KEY]).'
    );
  }
}
