import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats running speed (m/s) into pacing format (MM:SS / km or / mi).
 * 
 * @param speedMps Speed in meters per second
 * @param unit Unit type: 'km' or 'mi'
 */
export function formatPace(speedMps: number, unit: 'km' | 'mi' = 'km'): string {
  if (speedMps <= 0.1) return '--:--';
  
  const factor = unit === 'km' ? 1000 : 1609.344;
  const totalSecondsPerUnit = factor / speedMps;
  
  const minutes = Math.floor(totalSecondsPerUnit / 60);
  const seconds = Math.floor(totalSecondsPerUnit % 60);
  
  if (minutes >= 60) return '--:--'; // Out of bounds running pace
  
  const formattedSeconds = seconds.toString().padStart(2, '0');
  return `${minutes}:${formattedSeconds}`;
}

/**
 * Formats distance in meters into a readable string (km or mi).
 * 
 * @param meters Distance in meters
 * @param unit Unit type: 'km' or 'mi'
 * @param decimals Number of decimal places (defaults to 2)
 */
export function formatDistance(meters: number, unit: 'km' | 'mi' = 'km', decimals = 2): string {
  if (meters <= 0) return '0.00';
  const divisor = unit === 'km' ? 1000 : 1609.344;
  const value = meters / divisor;
  return value.toFixed(decimals);
}

/**
 * Formats duration in seconds into a standard digital duration (HH:MM:SS or MM:SS).
 * 
 * @param totalSeconds Total duration in seconds
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00';
  
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  
  const formattedMins = mins.toString().padStart(2, '0');
  const formattedSecs = secs.toString().padStart(2, '0');
  
  if (hrs > 0) {
    return `${hrs}:${formattedMins}:${formattedSecs}`;
  }
  return `${mins}:${formattedSecs}`;
}

/**
 * Formats elevation in meters to readable numbers (meters or feet).
 * 
 * @param meters Elevation in meters
 * @param unit Unit type: 'm' or 'ft'
 */
export function formatElevation(meters: number, unit: 'm' | 'ft' = 'm'): string {
  if (unit === 'm') {
    return `${Math.round(meters)} m`;
  }
  return `${Math.round(meters * 3.28084)} ft`;
}
