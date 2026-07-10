export interface RegistryItem {
  id: string;
  source: 'Strava' | 'Intervals.icu' | 'Both';
  fieldName: string;
  canonicalMapping: string;
  visualization: string;
  widgetId: string;
  dashboardId: string;
  exportFormats: string[];
  searchSupport: boolean;
  filterSupport: boolean;
  dataQualityScore: number;
  missingPolicy: 'Omit' | 'Interpolate' | 'Zero-Fill' | 'Fallback to Default' | 'Signal Alarm';
  description: string;
}

export const DATA_COVERAGE_REGISTRY: RegistryItem[] = [
  {
    id: 'cov_hr',
    source: 'Both',
    fieldName: 'Heart Rate',
    canonicalMapping: 'averageHeartRateBpm, maxHeartRateBpm, heartRateBpm[]',
    visualization: 'Heart Rate Area Chart, Peak Indicators, HR Zone Distribution',
    widgetId: 'activity_analysis',
    dashboardId: 'activity_analysis',
    exportFormats: ['CSV', 'JSON', 'FIT', 'GPX'],
    searchSupport: true,
    filterSupport: true,
    dataQualityScore: 99.8,
    missingPolicy: 'Interpolate',
    description: 'BPM values synchronized at 1Hz from external optical/electrical chest strap sensors.'
  },
  {
    id: 'cov_power',
    source: 'Both',
    fieldName: 'Mechanical Power',
    canonicalMapping: 'averagePowerWatts, maxPowerWatts, powerWatts[]',
    visualization: 'Power Area Chart, Peak Power Durations, Power Zone Distribution',
    widgetId: 'activity_analysis',
    dashboardId: 'activity_analysis',
    exportFormats: ['CSV', 'JSON', 'FIT'],
    searchSupport: true,
    filterSupport: true,
    dataQualityScore: 99.5,
    missingPolicy: 'Zero-Fill',
    description: 'Instantaneous power in Watts measured via shoe-pod or treadmill power calculators.'
  },
  {
    id: 'cov_cadence',
    source: 'Both',
    fieldName: 'Running Cadence',
    canonicalMapping: 'averageCadenceRpm, maxCadenceRpm, cadenceRpm[]',
    visualization: 'Stride Cadence Area Chart, Average/Max spm Indicators',
    widgetId: 'activity_analysis',
    dashboardId: 'activity_analysis',
    exportFormats: ['CSV', 'JSON', 'FIT', 'GPX'],
    searchSupport: true,
    filterSupport: true,
    dataQualityScore: 99.9,
    missingPolicy: 'Interpolate',
    description: 'Steps per minute (SPM) derived from internal watch accelerometer or footpod.'
  },
  {
    id: 'cov_elevation',
    source: 'Both',
    fieldName: 'Elevation Profile',
    canonicalMapping: 'elevationGainMeters, elevationLossMeters, altitudeMeters[]',
    visualization: 'Altitude Area Fill Chart, Cumulative Ascent/Descent Gauges',
    widgetId: 'activity_analysis',
    dashboardId: 'activity_analysis',
    exportFormats: ['CSV', 'JSON', 'FIT', 'GPX'],
    searchSupport: true,
    filterSupport: true,
    dataQualityScore: 98.7,
    missingPolicy: 'Interpolate',
    description: 'Barometric altimeter measurements or digital elevation model (DEM) reference lookups.'
  },
  {
    id: 'cov_speed',
    source: 'Both',
    fieldName: 'Velocity / Speed',
    canonicalMapping: 'averageSpeedMps, maximumSpeedMps, velocityMps[]',
    visualization: 'Velocity Smoothed Trend Chart, Real-time Pace String mapping',
    widgetId: 'activity_analysis',
    dashboardId: 'activity_analysis',
    exportFormats: ['CSV', 'JSON', 'FIT', 'GPX'],
    searchSupport: true,
    filterSupport: true,
    dataQualityScore: 99.6,
    missingPolicy: 'Interpolate',
    description: 'Instantaneous running speed computed from high-frequency GPS differentials or footpod sensors.'
  },
  {
    id: 'cov_temp',
    source: 'Both',
    fieldName: 'Ambient Temperature',
    canonicalMapping: 'temperatureC, temperatureC[]',
    visualization: 'Atmospheric Temp Indicator, Secondary Timeline Overlay',
    widgetId: 'activity_analysis',
    dashboardId: 'activity_analysis',
    exportFormats: ['CSV', 'JSON', 'FIT'],
    searchSupport: true,
    filterSupport: true,
    dataQualityScore: 95.0,
    missingPolicy: 'Fallback to Default',
    description: 'Ambient air temperature captured via internal watch thermometer or connected weather API.'
  },
  {
    id: 'cov_gps',
    source: 'Strava',
    fieldName: 'GPS Coordinates',
    canonicalMapping: 'gpsPolyline, latlng[][]',
    visualization: 'Interactive Coordinates SVG Map Vector Trail, Map Marker Pin lock',
    widgetId: 'activity_analysis',
    dashboardId: 'activity_analysis',
    exportFormats: ['GPX', 'JSON'],
    searchSupport: true,
    filterSupport: false,
    dataQualityScore: 99.2,
    missingPolicy: 'Omit',
    description: 'Dual-frequency L1+L5 GPS coordinates tracking geographic location stream.'
  },
  {
    id: 'cov_gct',
    source: 'Intervals.icu',
    fieldName: 'Ground Contact Time',
    canonicalMapping: 'groundContactTime[] (custom streams)',
    visualization: 'Mechanical Stride Inspector Grid Column, Stride Analytics Box',
    widgetId: 'activity_analysis',
    dashboardId: 'activity_analysis',
    exportFormats: ['CSV', 'JSON'],
    searchSupport: false,
    filterSupport: true,
    dataQualityScore: 98.2,
    missingPolicy: 'Interpolate',
    description: 'Ground Contact Time (GCT) in milliseconds, defining stance phase duration.'
  },
  {
    id: 'cov_osc',
    source: 'Intervals.icu',
    fieldName: 'Vertical Oscillation',
    canonicalMapping: 'verticalOscillation[] (custom streams)',
    visualization: 'Mechanical Stride Inspector Grid Column, Stride Analytics Box',
    widgetId: 'activity_analysis',
    dashboardId: 'activity_analysis',
    exportFormats: ['CSV', 'JSON'],
    searchSupport: false,
    filterSupport: true,
    dataQualityScore: 98.0,
    missingPolicy: 'Interpolate',
    description: 'Vertical bouncing displacement in centimeters during the flight phase.'
  },
  {
    id: 'cov_gear',
    source: 'Strava',
    fieldName: 'Shoes / Gear Wear',
    canonicalMapping: 'shoesId, CanonicalGear.distanceMeters',
    visualization: 'Wear Mileage Progression Bars, Gear Status Invariants',
    widgetId: 'activity_analysis',
    dashboardId: 'activity_analysis',
    exportFormats: ['JSON'],
    searchSupport: true,
    filterSupport: true,
    dataQualityScore: 100.0,
    missingPolicy: 'Fallback to Default',
    description: 'Accumulated wear mileage of running shoes tracked via athlete gear registers.'
  },
  {
    id: 'cov_weather',
    source: 'Both',
    fieldName: 'Weather Conditions',
    canonicalMapping: 'weather.temperatureC, weather.humidityPercent, weather.windSpeedMps',
    visualization: 'Atmospheric Condition Sub-ribbons, Thermal Coefficient Diagnostic',
    widgetId: 'activity_analysis',
    dashboardId: 'activity_analysis',
    exportFormats: ['JSON'],
    searchSupport: true,
    filterSupport: true,
    dataQualityScore: 97.4,
    missingPolicy: 'Fallback to Default',
    description: 'Environmental wind, humidity, precipitation, and temperature parameters during execution.'
  }
];
