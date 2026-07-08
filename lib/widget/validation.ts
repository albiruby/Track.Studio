/**
 * Track.Studio — Widget Validation Engine
 * Validates ViewModels against registered contracts to prevent runtime rendering failures.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class WidgetValidation {
  /**
   * Validates Home Profile ViewModel
   */
  public static validateHomeProfile(data: any): ValidationResult {
    if (!data) {
      return { isValid: false, error: 'ViewModel data is null or undefined.' };
    }
    const requiredKeys = ['id', 'name', 'vo2max', 'ftpWatts', 'restingHr', 'maxHr', 'weightKg'];
    for (const key of requiredKeys) {
      if (data[key] === undefined) {
        return { isValid: false, error: `HomeProfile missing required key: "${key}"` };
      }
    }
    if (!data.calculatedThresholds || typeof data.calculatedThresholds !== 'object') {
      return { isValid: false, error: 'HomeProfile missing "calculatedThresholds" object.' };
    }
    return { isValid: true };
  }

  /**
   * Validates Recent Ingested Activity ViewModel
   */
  public static validateRecentActivity(data: any): ValidationResult {
    if (!data) {
      return { isValid: false, error: 'ViewModel data is null or undefined.' };
    }
    const requiredKeys = ['id', 'title', 'distanceMeters', 'durationSeconds', 'runningStressScore', 'intensityFactor', 'averagePace'];
    for (const key of requiredKeys) {
      if (data[key] === undefined) {
        return { isValid: false, error: `RecentActivity missing required key: "${key}"` };
      }
    }
    return { isValid: true };
  }

  /**
   * Validates Weekly Training Volume Breakdown ViewModel
   */
  public static validateWeeklySummary(data: any): ValidationResult {
    if (!data) {
      return { isValid: false, error: 'ViewModel data is null or undefined.' };
    }
    const requiredKeys = ['currentWeekDistanceKm', 'currentWeekDurationMinutes', 'currentWeekRss', 'targetDistanceKm', 'targetRss', 'dailyBreakdown'];
    for (const key of requiredKeys) {
      if (data[key] === undefined) {
        return { isValid: false, error: `WeeklySummary missing required key: "${key}"` };
      }
    }
    if (!Array.isArray(data.dailyBreakdown)) {
      return { isValid: false, error: 'WeeklySummary "dailyBreakdown" must be a valid array.' };
    }
    return { isValid: true };
  }

  /**
   * Validates Performance Load Matrix ViewModel
   */
  public static validatePerformanceMetrics(data: any): ValidationResult {
    if (!data) {
      return { isValid: false, error: 'ViewModel data is null or undefined.' };
    }
    const requiredKeys = ['currentCtl', 'currentAtl', 'currentTsb', 'ctlRampRate', 'overtrainingRisk', 'peakingState'];
    for (const key of requiredKeys) {
      if (data[key] === undefined) {
        return { isValid: false, error: `PerformanceMetrics missing required key: "${key}"` };
      }
    }
    return { isValid: true };
  }

  /**
   * Validates Fitness & Fatigue Trends ViewModel
   */
  public static validatePerformanceTrend(data: any): ValidationResult {
    if (!data) {
      return { isValid: false, error: 'ViewModel data is null or undefined.' };
    }
    if (!Array.isArray(data)) {
      return { isValid: false, error: 'PerformanceTrend data must be a valid array.' };
    }
    if (data.length > 0) {
      const sample = data[0];
      const requiredKeys = ['date', 'ctl', 'atl', 'tsb'];
      for (const key of requiredKeys) {
        if (sample[key] === undefined) {
          return { isValid: false, error: `PerformanceTrend item missing key: "${key}"` };
        }
      }
    }
    return { isValid: true };
  }

  /**
   * Validates Activity Index Directory ViewModel
   */
  public static validateActivityList(data: any): ValidationResult {
    if (!data) {
      return { isValid: false, error: 'ViewModel data is null or undefined.' };
    }
    if (!data.activities || !Array.isArray(data.activities)) {
      return { isValid: false, error: 'ActivityList missing or invalid "activities" array.' };
    }
    if (data.activities.length > 0) {
      const sample = data.activities[0];
      const requiredKeys = ['id', 'title', 'date', 'distanceKm', 'duration', 'pace', 'rss', 'status'];
      for (const key of requiredKeys) {
        if (sample[key] === undefined) {
          return { isValid: false, error: `ActivityList item missing key: "${key}"` };
        }
      }
    }
    return { isValid: true };
  }

  /**
   * Master validation dispatcher
   */
  public static validate(widgetId: string, data: any): ValidationResult {
    switch (widgetId) {
      case 'home_profile':
        return this.validateHomeProfile(data);
      case 'home_recent_activity':
        return this.validateRecentActivity(data);
      case 'home_weekly_summary':
        return this.validateWeeklySummary(data);
      case 'home_performance_metrics':
        return this.validatePerformanceMetrics(data);
      case 'perf_fitness_fatigue':
        return this.validatePerformanceTrend(data);
      case 'act_list_view':
        return this.validateActivityList(data);
      default:
        // By default, if we don't have custom validation, assume valid
        return { isValid: true };
    }
  }
}
