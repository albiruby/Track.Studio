import { FormatterType } from '@/types/visualization';

export class VisualizationFormatter {
  /**
   * Formats a raw value into a localized/styled string based on the formatter type
   */
  public static format(value: any, type: FormatterType, unit: string = ''): string {
    if (value === undefined || value === null) return '--';

    switch (type) {
      case 'distance':
        return this.formatDistance(value, unit);
      case 'duration':
        return this.formatDuration(value);
      case 'pace':
        return this.formatPace(value, unit);
      case 'speed':
        return this.formatSpeed(value, unit);
      case 'heart-rate':
        return `${Math.round(Number(value))} bpm`;
      case 'power':
        return `${Math.round(Number(value))} W`;
      case 'cadence':
        return `${Math.round(Number(value))} rpm`;
      case 'elevation':
        return this.formatElevation(value, unit);
      case 'temperature':
        return `${Math.round(Number(value))}°C`;
      case 'calories':
        return `${Math.round(Number(value))} kcal`;
      case 'percentages':
        return `${(Number(value) * 100).toFixed(1)}%`;
      case 'date':
        return this.formatDate(value);
      case 'time':
        return this.formatTime(value);
      case 'timezone':
        return String(value);
      case 'units':
      default:
        return `${value}${unit ? ' ' + unit : ''}`;
    }
  }

  private static formatDistance(meters: number, unit: string): string {
    const km = meters / 1000;
    if (unit === 'miles' || unit === 'mi') {
      const miles = km * 0.621371;
      return `${miles.toFixed(2)} mi`;
    }
    return `${km.toFixed(2)} km`;
  }

  private static formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private static formatPace(metersPerSecond: number, unit: string): string {
    if (metersPerSecond <= 0) return '--:--';
    if (unit === 'miles' || unit === 'mi') {
      const totalSeconds = Math.round(1609.34 / metersPerSecond);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')} /mi`;
    }
    const totalSeconds = Math.round(1000 / metersPerSecond);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} /km`;
  }

  private static formatSpeed(metersPerSecond: number, unit: string): string {
    const kmh = metersPerSecond * 3.6;
    if (unit === 'miles' || unit === 'mi') {
      const mph = kmh * 0.621371;
      return `${mph.toFixed(1)} mph`;
    }
    return `${kmh.toFixed(1)} km/h`;
  }

  private static formatElevation(meters: number, unit: string): string {
    if (unit === 'feet' || unit === 'ft') {
      const feet = meters * 3.28084;
      return `${Math.round(feet)} ft`;
    }
    return `${Math.round(meters)} m`;
  }

  private static formatDate(value: any): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private static formatTime(value: any): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
}
