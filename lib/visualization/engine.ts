import { VISUALIZATION_REGISTRY } from './registry';
import { VisualizationBuilder } from './builder';
import { VisualizationFormatter } from './formatter';
import { VisualizationModel, FormatterType } from '@/types/visualization';

export class VisualizationEngine {
  /**
   * Retrieves the schema version of the registered visualization template
   */
  public static getVersion(visId: string): string {
    const entry = VISUALIZATION_REGISTRY[visId];
    if (!entry) {
      throw new Error(`VisualizationEngine: Visualization with ID "${visId}" is not registered.`);
    }
    return entry.version;
  }

  /**
   * Formats a raw scalar metric securely using our formatting library
   */
  public static formatMetric(value: any, formatType: FormatterType, unit?: string): string {
    return VisualizationFormatter.format(value, formatType, unit);
  }

  /**
   * Orchestrates the transformation of raw analytical ViewModels into fully resolved presentation payloads
   */
  public static compileModel(
    visId: string,
    rawViewModel: Record<string, any>[],
    options: {
      xAxisKey: string;
      xAxisLabel: string;
      xAxisScale: 'linear' | 'logarithmic' | 'time' | 'ordinal' | 'categorical';
      yAxisKey: string;
      yAxisLabel: string;
      yAxisScale: 'linear' | 'logarithmic' | 'time' | 'ordinal' | 'categorical';
      seriesKeys: { key: string; label: string; colorPreset?: 'primary' | 'secondary' | 'success' | 'warning' | 'critical' | 'neutral' }[];
      reducedMotion?: boolean;
    }
  ): VisualizationModel {
    return VisualizationBuilder.build(visId, rawViewModel, options);
  }
}
