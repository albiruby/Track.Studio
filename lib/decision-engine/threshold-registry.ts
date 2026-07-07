import { ThresholdConfig, DecisionCategory } from './types';

export class ThresholdRegistry {
  private static registry = new Map<string, ThresholdConfig>();

  /**
   * Registers a threshold configuration.
   */
  public static register(config: ThresholdConfig): void {
    this.registry.set(config.thresholdId, config);
  }

  /**
   * Retrieves a registered threshold configuration by ID.
   */
  public static get(thresholdId: string): ThresholdConfig | undefined {
    return this.registry.get(thresholdId);
  }

  /**
   * Lists all registered threshold configurations.
   */
  public static list(): ThresholdConfig[] {
    return Array.from(this.registry.values());
  }

  /**
   * Lists thresholds by decision category.
   */
  public static listByCategory(category: DecisionCategory): ThresholdConfig[] {
    return this.list().filter(t => t.category === category);
  }

  /**
   * Evaluates a numeric value against a threshold configuration, returning the matching band.
   */
  public static evaluate(thresholdId: string, value: number): { label: string; color?: string } | undefined {
    const config = this.get(thresholdId);
    if (!config) return undefined;

    // Find the first band where value is within [min, max)
    // For the last band, we can make it inclusive of max as well, or we can use standard boundaries.
    const band = config.bands.find(b => value >= b.min && value <= b.max);
    if (band) {
      return { label: band.label, color: band.color };
    }

    // Fallbacks if value overflows/underflows bounds slightly
    if (config.bands.length > 0) {
      const sortedBands = [...config.bands].sort((a, b) => a.min - b.min);
      if (value < sortedBands[0].min) {
        return { label: sortedBands[0].label, color: sortedBands[0].color };
      }
      const last = sortedBands[sortedBands.length - 1];
      if (value > last.max) {
        return { label: last.label, color: last.color };
      }
    }

    return undefined;
  }
}

// ========================================================
// DEFAULT SPORT SCIENCE THRESHOLD DEFINITIONS
// ========================================================

// 1. TRAINING Stress Balance (TSB) / Athletic Form
ThresholdRegistry.register({
  thresholdId: 'tsb_form_zones',
  name: 'Training Stress Balance Form Zones',
  category: 'recovery',
  version: '1.0.0',
  description: 'Athletic readiness zone classification based on Coggan’s Training Stress Balance (TSB = CTL - ATL).',
  bands: [
    { label: 'Highly Fatigued', min: -100, max: -30, color: '#ef4444' }, // Red
    { label: 'Fatigued', min: -30, max: -10, color: '#f97316' },        // Orange
    { label: 'Optimal Training', min: -10, max: 5, color: '#10b981' },   // Green
    { label: 'Peaking / Fresh', min: 5, max: 25, color: '#3b82f6' },     // Blue
    { label: 'Transition / Deconditioning', min: 25, max: 100, color: '#6b7280' } // Gray
  ]
});

// 2. 7-Day Training Monotony
ThresholdRegistry.register({
  thresholdId: 'training_monotony_risk',
  name: '7-Day Training Monotony Risk Levels',
  category: 'consistency',
  version: '1.0.0',
  description: 'Uniformity index of daily training load. High uniformity increases injury and illness risk.',
  bands: [
    { label: 'Very Low Variation', min: 2.0, max: 10.0, color: '#ef4444' }, // Red (High Risk)
    { label: 'Elevated Monotony', min: 1.5, max: 2.0, color: '#f97316' },    // Orange
    { label: 'Optimal Variation', min: 1.0, max: 1.5, color: '#10b981' },    // Green (Balanced)
    { label: 'High Variation', min: 0.0, max: 1.0, color: '#3b82f6' }        // Blue (Extremely varied/irregular)
  ]
});

// 3. 7-Day Training Strain
ThresholdRegistry.register({
  thresholdId: 'training_strain_risk',
  name: '7-Day Training Strain Risk Levels',
  category: 'recovery',
  version: '1.0.0',
  description: 'Combined risk of overtraining index (Volume Load * Monotony).',
  bands: [
    { label: 'Critical Risk', min: 3000, max: 100000, color: '#ef4444' }, // Red (Foster 1998 overtraining syndrome threshold)
    { label: 'High Risk', min: 2000, max: 3000, color: '#f97316' },      // Orange
    { label: 'Optimal Stimulus', min: 500, max: 2000, color: '#10b981' }, // Green
    { label: 'Low Stimulus', min: 0, max: 500, color: '#6b7280' }         // Gray
  ]
});

// 4. Training Ramp Rate (Weekly CTL Gain)
ThresholdRegistry.register({
  thresholdId: 'weekly_ramp_rate',
  name: 'Weekly CTL Ramp Rate',
  category: 'training_load',
  version: '1.0.0',
  description: 'Rate of chronic load progression. Safe bounds prevent soft tissue injury.',
  bands: [
    { label: 'Excessive Gain (Danger)', min: 8.0, max: 100.0, color: '#ef4444' }, // Red
    { label: 'Elevated Gain (Caution)', min: 5.0, max: 8.0, color: '#f97316' },  // Orange
    { label: 'Optimal Progression', min: 1.5, max: 5.0, color: '#10b981' },      // Green
    { label: 'Maintenance / Decline', min: -100.0, max: 1.5, color: '#6b7280' }  // Gray
  ]
});

// 5. Aerobic Decoupling (Pa:Hr)
ThresholdRegistry.register({
  thresholdId: 'aerobic_decoupling_efficiency',
  name: 'Aerobic Decoupling Levels',
  category: 'heart_rate',
  version: '1.0.0',
  description: 'Aerobic stability comparison of power/pace to heart rate over two halves of a steady workout.',
  bands: [
    { label: 'High Decoupling (Deconditioned)', min: 10.0, max: 100.0, color: '#ef4444' }, // Red
    { label: 'Moderate Decoupling', min: 5.0, max: 10.0, color: '#f97316' },               // Orange
    { label: 'Excellent Aerobic Fitness', min: -10.0, max: 5.0, color: '#10b981' }         // Green
  ]
});

// 6. Cardiovascular Drift
ThresholdRegistry.register({
  thresholdId: 'cardiac_drift_zones',
  name: 'Cardiac Drift Levels',
  category: 'heart_rate',
  version: '1.0.0',
  description: 'Raw percentage heart rate drift over a workout.',
  bands: [
    { label: 'Critical Drift (Heat/Dehydration)', min: 15.0, max: 100.0, color: '#ef4444' },
    { label: 'Elevated Drift', min: 8.0, max: 15.0, color: '#f97316' },
    { label: 'Normal Drift', min: -5.0, max: 8.0, color: '#10b981' }
  ]
});

// 7. Pace Stability / Pace Coefficient of Variation
ThresholdRegistry.register({
  thresholdId: 'pace_stability_index',
  name: 'Pacing Stability Levels',
  category: 'pacing',
  version: '1.0.0',
  description: 'Measures pace regularity. High stability represents perfect pacing execution on flat terrain.',
  bands: [
    { label: 'Highly Consistent', min: 0.95, max: 1.0, color: '#10b981' },
    { label: 'Consistent', min: 0.85, max: 0.95, color: '#3b82f6' },
    { label: 'Moderately Variable', min: 0.70, max: 0.85, color: '#f97316' },
    { label: 'Highly Variable (Intervals/Hills)', min: 0.0, max: 0.70, color: '#6b7280' }
  ]
});

// 8. Cadence Stability
ThresholdRegistry.register({
  thresholdId: 'cadence_stability',
  name: 'Cadence Stability Levels',
  category: 'cadence',
  version: '1.0.0',
  description: 'Cadence stability indicator zones.',
  bands: [
    { label: 'Excellent', min: 175.0, max: 210.0, color: '#10b981' },
    { label: 'Stable', min: 165.0, max: 175.0, color: '#3b82f6' },
    { label: 'Variable', min: 150.0, max: 165.0, color: '#f97316' },
    { label: 'Unstable', min: 0.0, max: 150.0, color: '#ef4444' }
  ]
});

// 9. Running Power Variability Index (VI)
ThresholdRegistry.register({
  thresholdId: 'power_variability_index',
  name: 'Power Variability Index (VI)',
  category: 'power',
  version: '1.0.0',
  description: 'Normalized Power / Average Power ratio. Higher values imply irregular paced surges.',
  bands: [
    { label: 'Stable', min: 1.0, max: 1.05, color: '#10b981' },
    { label: 'Efficient', min: 1.05, max: 1.10, color: '#3b82f6' },
    { label: 'Variable', min: 1.10, max: 1.20, color: '#f97316' },
    { label: 'Highly Variable', min: 1.20, max: 2.0, color: '#ef4444' }
  ]
});

// 10. Data Integrity Score
ThresholdRegistry.register({
  thresholdId: 'data_integrity_quality',
  name: 'Data Integrity Quality Levels',
  category: 'data_quality',
  version: '1.0.0',
  description: 'Quality score assessing sensor coverage and dropouts.',
  bands: [
    { label: 'Excellent', min: 90.0, max: 100.0, color: '#10b981' },
    { label: 'Good', min: 75.0, max: 90.0, color: '#3b82f6' },
    { label: 'Acceptable', min: 50.0, max: 75.0, color: '#f97316' },
    { label: 'Poor', min: 25.0, max: 50.0, color: '#6b7280' },
    { label: 'Insufficient', min: 0.0, max: 25.0, color: '#ef4444' }
  ]
});

// 11. Apparent Temperature (Steadman Heat Stress)
ThresholdRegistry.register({
  thresholdId: 'apparent_temperature_stress',
  name: 'Environmental Apparent Temp Stress',
  category: 'environment',
  version: '1.0.0',
  description: 'Apparent temperature indices mapping metabolic risk.',
  bands: [
    { label: 'Extreme Heat', min: 40.0, max: 100.0, color: '#ef4444' },
    { label: 'Hot', min: 30.0, max: 40.0, color: '#f97316' },
    { label: 'Warm', min: 20.0, max: 30.0, color: '#eab308' },
    { label: 'Comfortable', min: 5.0, max: 20.0, color: '#10b981' },
    { label: 'Cold Stress', min: -50.0, max: 5.0, color: '#3b82f6' }
  ]
});

// 12. Altitude Exposure levels
ThresholdRegistry.register({
  thresholdId: 'altitude_exposure_level',
  name: 'Elevation Altitude Exposure',
  category: 'elevation',
  version: '1.0.0',
  description: 'Atmospheric density classification by altitude height (meters).',
  bands: [
    { label: 'Extreme Exposure', min: 3000.0, max: 9000.0, color: '#ef4444' },
    { label: 'High Exposure', min: 2000.0, max: 3000.0, color: '#f97316' },
    { label: 'Moderate Exposure', min: 1000.0, max: 2000.0, color: '#3b82f6' },
    { label: 'Sea Level / Low Altitude', min: -100.0, max: 1000.0, color: '#10b981' }
  ]
});
