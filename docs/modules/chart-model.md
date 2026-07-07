# Chart Model & Domain Specifications

The `VisualizationModel` acts as the single source of truth for all widget renderers. This model is static, serializable, and defines all properties required to build accessible charts.

## Model Schema

```typescript
export interface VisualizationModel {
  id: string;                         // Unique registration ID
  type: VisualizationType;           // Design layout (line, area, bar, etc.)
  inputViewModel: string;            // Name of the originating analytical structure
  requiredFields: string[];          // Fields that must exist in input
  formattedData: Record<string, any>[];// Processed view dataset
  xAxis: AxisModel;                  // Linear/logarithmic horizontal bounds
  yAxis: AxisModel;                  // Linear/logarithmic vertical bounds
  legend: LegendConfig;              // Grouping colors and labels configuration
  theme: VisualizationTheme;         // Primary, secondary, grid colors
  accessibility: AccessibilityMetadata;// Alternative data matrices and aria help
  version: string;                   // Semantic API version
}
```

## Formatter Formats

Track.Studio contains a built-in formatting registry to convert raw values to elegant display strings:

- **distance**: Metres transformed to miles/kms.
- **duration**: Seconds configured to `HH:MM:SS`.
- **pace**: Velocity transformed to minutes per kilometer or mile.
- **heart-rate**: Beats per minute.
- **power**: Active watts representation.
- **cadence**: Revolutions per minute.
