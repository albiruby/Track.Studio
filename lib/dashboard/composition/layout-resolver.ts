import { 
  DashboardTemplate, 
  CompositionPreferences, 
  ResolvedLayout, 
  ResolvedWidget, 
  Breakpoint,
  LayoutType
} from '@/types/composition';
import { WidgetSize } from '@/types/widget';

export class ResponsiveLayoutResolver {
  /**
   * Matches container width to defined breakpoint ranges
   */
  public static resolveBreakpoint(width: number): Breakpoint {
    if (width >= 1600) return 'ultra-wide';
    if (width >= 1024) return 'desktop';
    if (width >= 768) return 'tablet';
    return 'mobile';
  }

  /**
   * Translates widget size relative to responsive columns to prevent grid overflow
   */
  public static scaleWidgetSize(size: WidgetSize, maxCols: number): WidgetSize {
    if (maxCols === 1) {
      return 'Full Width';
    }
    if (maxCols === 2) {
      if (size === 'L' || size === 'XL' || size === 'Full Width') {
        return 'Full Width';
      }
      return size;
    }
    return size;
  }
}

export class LayoutResolver {
  /**
   * Resoves full structural layout from template rules and optional user preferences
   */
  public static resolve(
    template: DashboardTemplate,
    preferences: CompositionPreferences | null,
    width: number
  ): ResolvedLayout {
    const breakpoint = ResponsiveLayoutResolver.resolveBreakpoint(width);
    
    // Find the closest responsive rule matching the active breakpoint
    const activeRule = template.responsiveRules.find(r => r.breakpoint === breakpoint) 
      || template.responsiveRules[template.responsiveRules.length - 1];

    const currentLayoutType: LayoutType = preferences?.layoutType || template.layoutType;
    const cols = activeRule ? activeRule.cols : template.gridDefinition.cols;
    const gap = template.gridDefinition.gap;

    // Build the resolved widget list with correct sizing, ordering, and state flags
    const activeOrder = preferences?.widgetOrder && preferences.widgetOrder.length > 0
      ? preferences.widgetOrder
      : template.widgetOrder;

    const resolvedWidgets: ResolvedWidget[] = activeOrder.map((widgetId, index) => {
      // 1. Determine visibility
      let isVisible = true;
      if (preferences?.widgetVisibility && preferences.widgetVisibility[widgetId] !== undefined) {
        isVisible = preferences.widgetVisibility[widgetId];
      } else if (template.widgetVisibility[widgetId] !== undefined) {
        isVisible = template.widgetVisibility[widgetId];
      }
      
      // Responsive rules can have a hard visibility override
      if (activeRule?.visibilityOverride && activeRule.visibilityOverride[widgetId] !== undefined) {
        isVisible = activeRule.visibilityOverride[widgetId];
      }

      // 2. Determine size
      let size: WidgetSize = 'M';
      if (preferences?.widgetSize && preferences.widgetSize[widgetId]) {
        size = preferences.widgetSize[widgetId];
      } else if (template.widgetSize[widgetId]) {
        size = template.widgetSize[widgetId];
      }
      
      // Responsive rule size override
      if (activeRule?.widgetSizes && activeRule.widgetSizes[widgetId]) {
        size = activeRule.widgetSizes[widgetId];
      }

      // Constrain size according to grid rules
      size = ResponsiveLayoutResolver.scaleWidgetSize(size, cols);

      // 3. Determine collapse state
      const isCollapsed = preferences?.collapsedSections?.includes(widgetId) || false;

      return {
        id: widgetId,
        size,
        isVisible,
        orderIndex: index,
        isCollapsed
      };
    });

    return {
      dashboardId: template.dashboardId,
      layoutType: currentLayoutType,
      cols,
      gap,
      widgets: resolvedWidgets,
      breakpoint
    };
  }
}
