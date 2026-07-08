/**
 * Track.Studio — Widget Capabilities
 * Declares supported features, dimensions, interactions, and zoom configurations.
 */

import { WidgetSize } from '@/types/widget';

export interface WidgetCapabilities {
  widgetId: string;
  supportedSizes: WidgetSize[];
  isResizable: boolean;
  isZoomable: boolean;
  zoomRange?: { min: number; max: number }; // Percentage, e.g. 50% to 200%
  supportedExports: ('CSV' | 'JSON' | 'FIT' | 'GPX')[];
  interactiveFeatures: {
    tooltips: boolean;
    zoneFiltering: boolean;
    metricToggles: boolean;
    fullscreenZoom: boolean;
  };
  offlineAvailability: 'fully_available' | 'cached_only' | 'unavailable';
}

export const WIDGET_CAPABILITIES_REGISTRY: Record<string, WidgetCapabilities> = {
  home_profile: {
    widgetId: 'home_profile',
    supportedSizes: ['S', 'M', 'L'],
    isResizable: true,
    isZoomable: false,
    supportedExports: ['JSON'],
    interactiveFeatures: {
      tooltips: true,
      zoneFiltering: false,
      metricToggles: true,
      fullscreenZoom: false
    },
    offlineAvailability: 'fully_available'
  },
  home_recent_activity: {
    widgetId: 'home_recent_activity',
    supportedSizes: ['M', 'L', 'XL'],
    isResizable: true,
    isZoomable: false,
    supportedExports: ['JSON', 'GPX'],
    interactiveFeatures: {
      tooltips: true,
      zoneFiltering: true,
      metricToggles: true,
      fullscreenZoom: true
    },
    offlineAvailability: 'cached_only'
  },
  home_weekly_summary: {
    widgetId: 'home_weekly_summary',
    supportedSizes: ['S', 'M', 'L'],
    isResizable: true,
    isZoomable: false,
    supportedExports: ['CSV', 'JSON'],
    interactiveFeatures: {
      tooltips: true,
      zoneFiltering: false,
      metricToggles: false,
      fullscreenZoom: false
    },
    offlineAvailability: 'fully_available'
  },
  home_performance_metrics: {
    widgetId: 'home_performance_metrics',
    supportedSizes: ['M', 'L', 'XL'],
    isResizable: true,
    isZoomable: true,
    zoomRange: { min: 80, max: 150 },
    supportedExports: ['CSV', 'JSON'],
    interactiveFeatures: {
      tooltips: true,
      zoneFiltering: true,
      metricToggles: true,
      fullscreenZoom: true
    },
    offlineAvailability: 'fully_available'
  },
  perf_fitness_fatigue: {
    widgetId: 'perf_fitness_fatigue',
    supportedSizes: ['M', 'L', 'XL'],
    isResizable: true,
    isZoomable: true,
    zoomRange: { min: 50, max: 200 },
    supportedExports: ['CSV', 'JSON'],
    interactiveFeatures: {
      tooltips: true,
      zoneFiltering: false,
      metricToggles: true,
      fullscreenZoom: true
    },
    offlineAvailability: 'fully_available'
  },
  act_list_view: {
    widgetId: 'act_list_view',
    supportedSizes: ['M', 'L', 'XL'],
    isResizable: true,
    isZoomable: false,
    supportedExports: ['CSV', 'JSON'],
    interactiveFeatures: {
      tooltips: false,
      zoneFiltering: true,
      metricToggles: true,
      fullscreenZoom: true
    },
    offlineAvailability: 'cached_only'
  }
};
