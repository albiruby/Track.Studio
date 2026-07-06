import { CanonicalActivity, CanonicalStream } from '@/lib/data-platform/canonical/types';

export const FORMULA_VERSION = '1.0.0';

/**
 * Calculates average temperature exposure (°C)
 */
export function calculateTemperatureExposure(activity: CanonicalActivity): number | null {
  return activity.weather ? activity.weather.temperatureC : null;
}

/**
 * Calculates average humidity exposure (%)
 */
export function calculateHumidityExposure(activity: CanonicalActivity): number | null {
  return activity.weather ? activity.weather.humidityPercent : null;
}

/**
 * Calculates Apparent Temperature (Heat Index) in °C combining Temperature & Humidity
 * Approximation formula for Apparent Temperature (Steadman's):
 * AT = Ta + 0.33 * e - 0.70 * ws - 4.00
 * where:
 * Ta = Air temperature (°C)
 * e = Water vapor pressure (hPa) = (rh / 100) * 6.105 * exp((17.27 * Ta) / (237.7 + Ta))
 * ws = Wind speed (m/s)
 */
export function calculateApparentTemperature(activity: CanonicalActivity): number | null {
  if (!activity.weather || activity.weather.temperatureC === null) return null;

  const ta = activity.weather.temperatureC;
  const rh = activity.weather.humidityPercent || 50; // default 50%
  const ws = activity.weather.windSpeedMps || 0; // default 0 mps

  // Calculate vapor pressure e in hPa
  const e = (rh / 100) * 6.105 * Math.exp((17.27 * ta) / (237.7 + ta));
  
  const at = ta + (0.33 * e) - (0.70 * ws) - 4.0;
  return parseFloat(at.toFixed(1));
}

/**
 * Calculates Altitude Exposure (Average elevation/altitude of training)
 */
export function calculateAltitudeExposure(activity: CanonicalActivity, stream?: CanonicalStream): number {
  if (stream && stream.altitudeMeters && stream.altitudeMeters.length > 0) {
    const validAlts = stream.altitudeMeters.filter(a => typeof a === 'number');
    if (validAlts.length > 0) {
      const sum = validAlts.reduce((a, b) => a + b, 0);
      return parseFloat((sum / validAlts.length).toFixed(1));
    }
  }

  // Fallback to average altitude in Elevation Gain/Loss or a baseline
  if (activity.elevation && activity.elevation.maxAltitudeMeters !== null && activity.elevation.minAltitudeMeters !== null) {
    return parseFloat(((activity.elevation.maxAltitudeMeters + activity.elevation.minAltitudeMeters) / 2).toFixed(1));
  }
  
  return 0;
}

/**
 * Calculates Wind Exposure (mps)
 */
export function calculateWindExposure(activity: CanonicalActivity): number | null {
  return activity.weather ? activity.weather.windSpeedMps : null;
}
