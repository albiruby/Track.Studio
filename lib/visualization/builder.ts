import { 
  VisualizationModel, 
  VisualizationRegistryEntry, 
  VisualizationTheme, 
  AxisModel, 
  LegendConfig, 
  AccessibilityMetadata 
} from '@/types/visualization';
import { VISUALIZATION_REGISTRY } from './registry';
import { VisualizationColorSystem } from './color-system';
import { AxisEngine } from './axis-engine';
import { LegendEngine } from './legend-engine';
import { VisualizationFormatter } from './formatter';

export class VisualizationBuilder {
  /**
   * Transforms a generic strongly-typed ViewModel payload into a polished, structured Presentation Model
   */
  public static build(
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
    const entry = VISUALIZATION_REGISTRY[visId];
    if (!entry) {
      throw new Error(`VisualizationBuilder: Visual configuration ID "${visId}" is not registered in VISUALIZATION_REGISTRY.`);
    }

    // Resolve theme
    const theme = VisualizationColorSystem.getTheme(entry.theme);

    // Filter and sanitize raw ViewModel records based on required fields
    const formattedData = rawViewModel.filter((record) => {
      return entry.requiredFields.every((field) => record[field] !== undefined && record[field] !== null);
    });

    // Resolve xAxis
    const xValues = formattedData.map((d) => d[options.xAxisKey]);
    const xAxis = AxisEngine.generateAxis(
      options.xAxisKey,
      options.xAxisScale,
      options.xAxisLabel,
      xValues
    );

    // Resolve yAxis
    const yValues = formattedData.map((d) => d[options.yAxisKey]);
    const yAxis = AxisEngine.generateAxis(
      options.yAxisKey,
      options.yAxisScale,
      options.yAxisLabel,
      yValues
    );

    // Compile dynamic legend configurations
    const legendItems = options.seriesKeys.map((s, index) => {
      let color = theme.colors.palette[index % theme.colors.palette.length];
      if (s.colorPreset && theme.colors[s.colorPreset]) {
        color = theme.colors[s.colorPreset];
      }
      return {
        key: s.key,
        label: s.label,
        color,
      };
    });
    const legend = LegendEngine.buildLegend(legendItems);

    // Compile screen-reader/ARIA accessibility metadata table
    const accessibility = this.compileAccessibilityMetadata(
      entry,
      formattedData,
      options.xAxisLabel,
      options.yAxisLabel,
      options.reducedMotion || false
    );

    return {
      id: entry.id,
      type: entry.type,
      inputViewModel: entry.inputViewModel,
      requiredFields: entry.requiredFields,
      formattedData,
      xAxis,
      yAxis,
      legend,
      theme,
      accessibility,
      version: entry.version,
    };
  }

  private static compileAccessibilityMetadata(
    entry: VisualizationRegistryEntry,
    data: Record<string, any>[],
    xLabel: string,
    yLabel: string,
    reducedMotion: boolean
  ): AccessibilityMetadata {
    const tableId = `alt-data-table-${entry.id}`;
    const dataPointsCount = data.length;
    const summary = `Visual graph with ID ${entry.id} representing ${entry.inputViewModel}. Type: ${entry.type}. Contains ${dataPointsCount} records matching metrics along the X-axis of ${xLabel} and Y-axis of ${yLabel}.`;

    return {
      ariaLabel: summary,
      summaryTableId: tableId,
      description: `A detailed, screen-readable alternative presentation layout for high-contrast accessibility compliance.`,
      alternativeData: data.map((d) => {
        const row: Record<string, any> = {};
        Object.keys(d).forEach((key) => {
          row[key] = d[key];
        });
        return row;
      }),
      reducedMotionEnabled: reducedMotion,
    };
  }
}
