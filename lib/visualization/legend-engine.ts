import { LegendConfig, LegendItem } from '@/types/visualization';

export class LegendEngine {
  /**
   * Builds and optimizes a legend layout depending on container bounds, sorting requirements, and logical groupings.
   */
  public static buildLegend(
    items: { key: string; label: string; color: string; group?: string }[],
    options: {
      position?: 'top' | 'bottom' | 'left' | 'right';
      layout?: 'horizontal' | 'vertical';
      sortBy?: 'label' | 'key';
      visibilityStates?: Record<string, boolean>;
    } = {}
  ): LegendConfig {
    const position = options.position || 'bottom';
    const layout = options.layout || 'horizontal';
    const visibilityStates = options.visibilityStates || {};

    let legendItems: LegendItem[] = items.map((it) => ({
      key: it.key,
      label: it.label,
      color: it.color,
      visible: visibilityStates[it.key] !== undefined ? visibilityStates[it.key] : true,
      group: it.group,
    }));

    // Sort items if needed
    if (options.sortBy === 'label') {
      legendItems.sort((a, b) => a.label.localeCompare(b.label));
    } else if (options.sortBy === 'key') {
      legendItems.sort((a, b) => a.key.localeCompare(b.key));
    }

    return {
      items: legendItems,
      position,
      layout,
    };
  }
}
