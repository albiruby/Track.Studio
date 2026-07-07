export type VisualizationType =
  | 'line'
  | 'area'
  | 'bar'
  | 'stacked-bar'
  | 'horizontal-bar'
  | 'scatter'
  | 'radar'
  | 'pie'
  | 'donut'
  | 'gauge'
  | 'histogram'
  | 'distribution'
  | 'calendar-heatmap'
  | 'timeline'
  | 'elevation-profile'
  | 'zone-distribution'
  | 'rolling-trend'
  | 'box-plot'
  | 'violin-plot'
  | 'hexbin';

export type FormatterType =
  | 'distance'
  | 'duration'
  | 'pace'
  | 'speed'
  | 'heart-rate'
  | 'power'
  | 'cadence'
  | 'elevation'
  | 'temperature'
  | 'calories'
  | 'percentages'
  | 'date'
  | 'time'
  | 'timezone'
  | 'units';

export type AxisScaleType = 'linear' | 'logarithmic' | 'time' | 'ordinal' | 'categorical';

export interface AxisModel {
  key: string;
  type: AxisScaleType;
  label: string;
  min?: number;
  max?: number;
  ticks?: (string | number)[];
  tickDensity: 'high' | 'medium' | 'low';
}

export interface LegendItem {
  key: string;
  label: string;
  color: string;
  visible: boolean;
  group?: string;
}

export interface LegendConfig {
  items: LegendItem[];
  position: 'top' | 'bottom' | 'left' | 'right';
  layout: 'horizontal' | 'vertical';
}

export interface TooltipItem {
  key: string;
  label: string;
  value: string | number;
  formattedValue: string;
  color: string;
}

export interface TooltipModel {
  title: string;
  items: TooltipItem[];
  accessibleLabel: string;
}

export interface AccessibilityMetadata {
  ariaLabel: string;
  summaryTableId: string;
  description: string;
  alternativeData: Record<string, any>[];
  reducedMotionEnabled: boolean;
}

export interface VisualizationTheme {
  colors: {
    success: string;
    warning: string;
    critical: string;
    neutral: string;
    primary: string;
    secondary: string;
    palette: string[];
  };
  gridColor: string;
  backgroundColor: string;
}

export interface VisualizationModel {
  id: string;
  type: VisualizationType;
  inputViewModel: string;
  requiredFields: string[];
  formattedData: Record<string, any>[];
  xAxis: AxisModel;
  yAxis: AxisModel;
  legend: LegendConfig;
  theme: VisualizationTheme;
  accessibility: AccessibilityMetadata;
  version: string;
}

export interface VisualizationRegistryEntry {
  id: string;
  type: VisualizationType;
  inputViewModel: string;
  requiredFields: string[];
  theme: 'slate' | 'high-contrast';
  version: string;
}
