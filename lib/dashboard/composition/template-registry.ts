import { DashboardTemplate, LayoutType } from '@/types/composition';
import { DASHBOARD_REGISTRY } from '@/lib/dashboard/registry';
import { WidgetSize } from '@/types/widget';

export const DashboardTemplateRegistry: Record<string, DashboardTemplate> = {};

// Default responsive rules that apply to most layouts
const DEFAULT_RESPONSIVE_RULES = [
  {
    breakpoint: 'ultra-wide' as const,
    minWidth: 1600,
    cols: 6,
  },
  {
    breakpoint: 'desktop' as const,
    minWidth: 1024,
    cols: 4,
  },
  {
    breakpoint: 'tablet' as const,
    minWidth: 768,
    cols: 2,
  },
  {
    breakpoint: 'mobile' as const,
    minWidth: 0,
    cols: 1,
  }
];

// Map from the dashboard layout template string to layout type
const layoutTemplateMap: Record<string, LayoutType> = {
  bento: 'bento',
  grid: 'grid',
  split: 'split',
  vertical: 'single-column',
  connections: 'two-column',
};

// Populate the template registry dynamically based on the 15 registered dashboards
Object.entries(DASHBOARD_REGISTRY).forEach(([id, entry]) => {
  if (id === 'activity_analysis') return; // Skip report template, which is a standalone layout and not a widget-based dashboard
  const layoutType = layoutTemplateMap[entry.layoutTemplate] || 'grid';
  
  // Set default sizes based on widgets
  const widgetSizes: Record<string, WidgetSize> = {};
  const widgetVisibility: Record<string, boolean> = {};
  
  entry.supportedWidgets.forEach((widgetId) => {
    widgetVisibility[widgetId] = true;
    
    // Assign reasonable default size
    if (widgetId.includes('profile') || widgetId.includes('weekly') || widgetId.includes('best')) {
      widgetSizes[widgetId] = 'S';
    } else if (widgetId.includes('metrics') || widgetId.includes('trend') || widgetId.includes('curve') || widgetId.includes('list')) {
      widgetSizes[widgetId] = 'L';
    } else {
      widgetSizes[widgetId] = 'M';
    }
  });

  const defaultPreferences = {
    widgetOrder: [...entry.supportedWidgets],
    widgetVisibility,
    widgetSize: widgetSizes,
    layoutType,
    collapsedSections: [],
    version: entry.version,
  };

  DashboardTemplateRegistry[id] = {
    dashboardId: id,
    layoutType,
    gridDefinition: {
      cols: layoutType === 'single-column' ? 1 : layoutType === 'split' ? 2 : 4,
      gap: 'gap-4',
    },
    widgetOrder: [...entry.supportedWidgets],
    widgetVisibility,
    widgetSize: widgetSizes,
    responsiveRules: id === 'search' || id === 'settings' 
      ? [
          { breakpoint: 'ultra-wide', minWidth: 1600, cols: 1 },
          { breakpoint: 'desktop', minWidth: 1024, cols: 1 },
          { breakpoint: 'tablet', minWidth: 768, cols: 1 },
          { breakpoint: 'mobile', minWidth: 0, cols: 1 }
        ]
      : DEFAULT_RESPONSIVE_RULES,
    minWidth: 320,
    maxWidth: 2400,
    collapsedSections: [],
    defaultPreferences,
    version: entry.version,
  };
});
