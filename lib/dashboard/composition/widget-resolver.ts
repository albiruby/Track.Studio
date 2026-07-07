import { WIDGET_REGISTRY } from '@/lib/dashboard/registry';
import { WidgetRegistryEntry } from '@/types/dashboard';

export class WidgetResolver {
  /**
   * Safely resolves a single widget by its ID, returning its metadata
   */
  public static resolveWidget(widgetId: string): WidgetRegistryEntry | null {
    const widget = WIDGET_REGISTRY[widgetId];
    if (!widget) {
      console.warn(`WidgetResolver: Widget ID "${widgetId}" is not registered in WIDGET_REGISTRY.`);
      return null;
    }
    return widget;
  }

  /**
   * Resolves a collection of widget IDs, removing unregistered entries
   */
  public static resolveWidgets(widgetIds: string[]): WidgetRegistryEntry[] {
    const resolved: WidgetRegistryEntry[] = [];
    widgetIds.forEach((id) => {
      const w = this.resolveWidget(id);
      if (w) {
        resolved.push(w);
      }
    });
    return resolved;
  }

  /**
   * Filters widgets based on layout requirements or capabilities
   */
  public static filterByDashboard(dashboardId: string, widgetIds: string[]): string[] {
    const resolved = this.resolveWidgets(widgetIds);
    // Future expansion could check permissions or active dashboard owners.
    // For now, return the safe list of resolved IDs.
    return resolved.map(w => w.id);
  }
}
