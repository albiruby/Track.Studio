export class Normalizer {
  /**
   * Normalize speed in meters per second (mps) to decimal pace in minutes per kilometer.
   * e.g. 4.0 mps (4 m/s) -> 1000 / (4 * 60) = 4.1666 min/km (4:10/km)
   */
  static mpsToPaceMinPerKm(mps: number | null | undefined): number {
    if (!mps || mps <= 0.1) return 0.0;
    const paceDecimal = 1000 / (mps * 60);
    // Round to 4 decimal places for precision
    return Math.round(paceDecimal * 10000) / 10000;
  }

  /**
   * Converts distance from various units to canonical meters.
   */
  static toMeters(value: number | null | undefined, unit: 'm' | 'km' | 'mi' | 'ft' = 'm'): number {
    if (value === null || value === undefined || isNaN(value)) return 0;
    switch (unit) {
      case 'km':
        return value * 1000;
      case 'mi':
        return value * 1609.344;
      case 'ft':
        return value * 0.3048;
      case 'm':
      default:
        return value;
    }
  }

  /**
   * Converts elevation to canonical meters.
   */
  static toElevationMeters(value: number | null | undefined, unit: 'm' | 'ft' = 'm'): number {
    if (value === null || value === undefined || isNaN(value)) return 0;
    return unit === 'ft' ? value * 0.3048 : value;
  }

  /**
   * Converts temperature to Celsius.
   */
  static toCelsius(temp: number | null | undefined, unit: 'C' | 'F' = 'C'): number | null {
    if (temp === null || temp === undefined || isNaN(temp)) return null;
    if (unit === 'F') {
      return Math.round(((temp - 32) * 5 / 9) * 10) / 10;
    }
    return Math.round(temp * 10) / 10;
  }

  /**
   * Formats string/epoch timestamps to clean UTC ISO 8601 strings.
   */
  static normalizeTimestamp(ts: string | number | null | undefined): string {
    if (!ts) return new Date().toISOString();
    try {
      if (typeof ts === 'number') {
        // Assume epoch ms if > 1e11, otherwise epoch seconds
        const ms = ts > 100000000000 ? ts : ts * 1000;
        return new Date(ms).toISOString();
      }
      return new Date(ts).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * Normalizes timezone to standard IANA database format or default.
   */
  static normalizeTimezone(tz: string | null | undefined): string {
    if (!tz) return 'UTC';
    
    const tzTrimmed = tz.trim();
    // Check if it's already a standard slash-split timezone (e.g. America/New_York)
    if (tzTrimmed.includes('/')) return tzTrimmed;

    // Map common offset names or short codes if necessary
    const commonMappings: Record<string, string> = {
      'EST': 'America/New_York',
      'EDT': 'America/New_York',
      'CST': 'America/Chicago',
      'CDT': 'America/Chicago',
      'MST': 'America/Denver',
      'MDT': 'America/Denver',
      'PST': 'America/Los_Angeles',
      'PDT': 'America/Los_Angeles',
      'GMT': 'UTC',
      'BST': 'Europe/London',
      'CET': 'Europe/Paris',
      'CEST': 'Europe/Paris',
      'AEST': 'Australia/Sydney',
      'AEDT': 'Australia/Sydney'
    };

    return commonMappings[tzTrimmed.toUpperCase()] || tzTrimmed || 'UTC';
  }

  /**
   * Rounds latitude/longitude coordinate to 6 decimal places (~10cm precision).
   */
  static normalizeCoordinate(coord: number | null | undefined): number {
    if (coord === null || coord === undefined || isNaN(coord)) return 0;
    return Math.round(coord * 1000000) / 1000000;
  }

  /**
   * Normalizes lat/lng coordinate arrays.
   */
  static normalizeLatLng(latlng: any): [number, number] | null {
    if (!latlng) return null;
    if (Array.isArray(latlng) && latlng.length >= 2) {
      const lat = Number(latlng[0]);
      const lng = Number(latlng[1]);
      if (isNaN(lat) || isNaN(lng)) return null;
      return [
        this.normalizeCoordinate(lat),
        this.normalizeCoordinate(lng)
      ];
    }
    return null;
  }

  /**
   * Trims strings and applies standard casing. Guaranteed to return a string.
   */
  static normalizeString(str: string | null | undefined, fallback: string = ''): string {
    if (!str) return fallback;
    return str.trim();
  }

  /**
   * Normalizes a nullable string.
   */
  static normalizeNullableString(str: string | null | undefined, fallback: string | null = null): string | null {
    if (!str) return fallback;
    return str.trim();
  }

  /**
   * Normalizes sport types to strict running or other category.
   */
  static normalizeSportType(sport: string | null | undefined): 'running' | 'trail_running' | 'other' {
    if (!sport) return 'other';
    const s = sport.toLowerCase().replace(/_/g, ' ').trim();
    if (s.includes('trail run') || s.includes('trail_running') || s.includes('trailrunning')) {
      return 'trail_running';
    }
    if (s.includes('run') || s.includes('running') || s.includes('jog')) {
      return 'running';
    }
    return 'other';
  }

  /**
   * Normalizes user visibility profiles.
   */
  static normalizeVisibility(vis: string | null | undefined): 'public' | 'followers_only' | 'only_me' {
    if (!vis) return 'public';
    const v = vis.toLowerCase().trim();
    if (v === 'private' || v === 'only_me' || v === 'only me') return 'only_me';
    if (v === 'followers' || v === 'followers_only' || v === 'followers only') return 'followers_only';
    return 'public';
  }

  /**
   * Normalizes gender representations.
   */
  static normalizeGender(g: string | null | undefined): 'M' | 'F' | 'Other' | null {
    if (!g) return null;
    const cleanG = g.toUpperCase().trim();
    if (cleanG.startsWith('M')) return 'M';
    if (cleanG.startsWith('F')) return 'F';
    if (cleanG === 'OTHER' || cleanG === 'O') return 'Other';
    return null;
  }

  /**
   * Cleans heart rate values to ensure they are physically realistic.
   */
  static normalizeHeartRate(hr: number | null | undefined): number | null {
    if (hr === null || hr === undefined || isNaN(hr) || hr <= 0) return null;
    const rounded = Math.round(hr);
    // Physical limits check: 30 bpm to 250 bpm
    if (rounded < 30 || rounded > 250) return null;
    return rounded;
  }

  /**
   * Cleans power values to ensure physical realism.
   */
  static normalizePower(power: number | null | undefined): number | null {
    if (power === null || power === undefined || isNaN(power) || power < 0) return null;
    const rounded = Math.round(power);
    // Physical limits check: up to 2500 Watts (world class sprinters)
    if (rounded > 2500) return null;
    return rounded;
  }

  /**
   * Normalizes cadence values.
   */
  static normalizeCadence(cadence: number | null | undefined): number | null {
    if (cadence === null || cadence === undefined || isNaN(cadence) || cadence < 0) return null;
    const rounded = Math.round(cadence);
    // Strava cadence is often double-foot (steps/min) or single-foot (rpm) depending on activity source.
    // Standardize to SPM (Steps Per Minute) / RPM (Revolutions Per Minute, or strides per minute for running).
    // Running cadence in Strava is typically single foot RPM (80-110). If it is stored as SPM (150-220), 
    // we can keep it as is but note it in documentation. Canonical model specifies RPM (usually strides/steps for one foot).
    if (rounded > 220) return null;
    return rounded;
  }
}
