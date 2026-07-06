export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    itemCount: number;
    providerVersionDetected?: string;
  };
}

export class ValidationEngine {
  /**
   * Safely checks JSON structure validity and content integrity.
   */
  static validateResponse(
    payload: any, 
    providerId: string, 
    dataType: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let itemCount = 0;

    // 1. Basic Corruption & Type Checks
    if (payload === undefined || payload === null) {
      errors.push('Response payload is null or undefined (corrupted stream).');
      return { isValid: false, errors, warnings, metadata: { itemCount: 0 } };
    }

    // 2. Format checks based on dataType
    if (dataType === 'activities' || dataType === 'events' || dataType === 'wellness') {
      if (!Array.isArray(payload)) {
        errors.push(`Expected payload array for type [${dataType}], but received: ${typeof payload}`);
        return { isValid: false, errors, warnings, metadata: { itemCount: 0 } };
      }
      itemCount = payload.length;

      // Inspect array items
      payload.forEach((item, index) => {
        if (typeof item !== 'object' || item === null) {
          errors.push(`Item at index [${index}] in the collection is not a valid object.`);
          return;
        }

        // Check required fields for each item based on providerId
        if (providerId === 'strava' && dataType === 'activities') {
          if (!item.id) {
            errors.push(`Activity at index [${index}] is missing external Identifier [id].`);
          }
          if (!item.start_date && !item.start_date_local) {
            errors.push(`Activity [${item.id || index}] is missing date fields [start_date].`);
          }
          if (item.start_date && isNaN(Date.parse(item.start_date))) {
            errors.push(`Activity [${item.id || index}] contains invalid date format [${item.start_date}].`);
          }
          if (!item.type && !item.sport_type) {
            warnings.push(`Activity [${item.id || index}] does not specify sport/activity type.`);
          }
        }

        if (providerId === 'intervals-icu' && dataType === 'activities') {
          if (!item.id) {
            errors.push(`Intervals Activity at index [${index}] is missing external Identifier [id].`);
          }
          if (!item.start_date_local && !item.start_date) {
            errors.push(`Intervals Activity [${item.id || index}] is missing date fields.`);
          }
          if (item.start_date && isNaN(Date.parse(item.start_date))) {
            errors.push(`Intervals Activity [${item.id || index}] contains invalid date format.`);
          }
        }
      });
    } else if (dataType === 'athlete') {
      if (typeof payload !== 'object' || Array.isArray(payload)) {
        errors.push(`Expected single athlete profile object, but received: ${Array.isArray(payload) ? 'Array' : typeof payload}`);
        return { isValid: false, errors, warnings, metadata: { itemCount: 0 } };
      }
      itemCount = 1;

      // Check required fields for profile
      if (providerId === 'strava') {
        if (!payload.id) {
          errors.push('Strava athlete profile is missing the primary Identifier [id].');
        }
      } else if (providerId === 'intervals-icu') {
        if (!payload.id && !payload.athleteId) {
          errors.push('Intervals.icu athlete profile is missing the primary Identifier [id/athleteId].');
        }
      }
    } else if (dataType === 'streams' || dataType === 'laps') {
      // streams can be an array of stream objects
      if (!Array.isArray(payload)) {
        warnings.push(`Streams/Laps returned a non-array response type: ${typeof payload}`);
      }
      itemCount = Array.isArray(payload) ? payload.length : 1;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        itemCount,
        providerVersionDetected: providerId === 'strava' ? 'v3' : 'v1'
      }
    };
  }
}
