import { DashboardTemplateRegistry } from './template-registry';
import { LayoutResolver } from './layout-resolver';
import { WidgetResolver } from './widget-resolver';
import { CompositionPersistence } from './persistence';
import { 
  DashboardTemplate, 
  CompositionPreferences, 
  ResolvedLayout,
  LayoutType
} from '@/types/composition';
import { WidgetSize } from '@/types/widget';

export class DashboardCompositionEngine {
  /**
   * Retrieves the template for a specified dashboard ID
   */
  public static getTemplate(dashboardId: string): DashboardTemplate {
    const template = DashboardTemplateRegistry[dashboardId];
    if (!template) {
      throw new Error(`DashboardCompositionEngine: Dashboard template with ID "${dashboardId}" is not registered.`);
    }
    return template;
  }

  /**
   * Loads current active preferences (user preferences or default fallback)
   */
  public static getPreferences(dashboardId: string): CompositionPreferences {
    const template = this.getTemplate(dashboardId);
    return CompositionPersistence.load(dashboardId, template);
  }

  /**
   * Resolves the full layout configuration for rendering
   */
  public static compose(
    dashboardId: string,
    width: number,
    customPrefs?: CompositionPreferences
  ): ResolvedLayout {
    const template = this.getTemplate(dashboardId);
    
    // Validate that all default template widgets exist in WIDGET_REGISTRY
    const validatedWidgets = WidgetResolver.filterByDashboard(
      dashboardId, 
      template.widgetOrder
    );

    // If some widgets were unregistered or removed, rebuild template fields
    if (validatedWidgets.length !== template.widgetOrder.length) {
      template.widgetOrder = validatedWidgets;
    }

    const preferences = customPrefs || this.getPreferences(dashboardId);
    return LayoutResolver.resolve(template, preferences, width);
  }

  /**
   * Updates user composition preferences
   */
  public static updatePreferences(
    dashboardId: string,
    updates: Partial<CompositionPreferences>
  ): CompositionPreferences {
    const template = this.getTemplate(dashboardId);
    const current = this.getPreferences(dashboardId);

    const merged: CompositionPreferences = {
      ...current,
      ...updates,
      widgetVisibility: {
        ...current.widgetVisibility,
        ...(updates.widgetVisibility || {})
      },
      widgetSize: {
        ...current.widgetSize,
        ...(updates.widgetSize || {})
      },
      collapsedSections: updates.collapsedSections || current.collapsedSections,
      version: template.version // Keep version locked to the current template spec
    };

    CompositionPersistence.save(dashboardId, merged);
    return merged;
  }

  /**
   * Updates single widget visibility preference
   */
  public static setWidgetVisibility(
    dashboardId: string,
    widgetId: string,
    isVisible: boolean
  ): CompositionPreferences {
    const prefs = this.getPreferences(dashboardId);
    const widgetVisibility = {
      ...prefs.widgetVisibility,
      [widgetId]: isVisible
    };
    return this.updatePreferences(dashboardId, { widgetVisibility });
  }

  /**
   * Updates single widget size preference
   */
  public static setWidgetSize(
    dashboardId: string,
    widgetId: string,
    size: WidgetSize
  ): CompositionPreferences {
    const prefs = this.getPreferences(dashboardId);
    const widgetSize = {
      ...prefs.widgetSize,
      [widgetId]: size
    };
    return this.updatePreferences(dashboardId, { widgetSize });
  }

  /**
   * Updates widget ordering list
   */
  public static setWidgetOrder(
    dashboardId: string,
    widgetOrder: string[]
  ): CompositionPreferences {
    return this.updatePreferences(dashboardId, { widgetOrder });
  }

  /**
   * Toggles collapsible section state for a widget
   */
  public static toggleSectionCollapse(
    dashboardId: string,
    widgetId: string
  ): CompositionPreferences {
    const prefs = this.getPreferences(dashboardId);
    let collapsedSections = [...prefs.collapsedSections];
    
    if (collapsedSections.includes(widgetId)) {
      collapsedSections = collapsedSections.filter(id => id !== widgetId);
    } else {
      collapsedSections.push(widgetId);
    }

    return this.updatePreferences(dashboardId, { collapsedSections });
  }

  /**
   * Resets a dashboard layout to template specifications
   */
  public static reset(dashboardId: string): CompositionPreferences {
    const template = this.getTemplate(dashboardId);
    return CompositionPersistence.reset(dashboardId, template);
  }
}
