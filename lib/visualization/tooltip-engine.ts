import { TooltipModel, TooltipItem } from '@/types/visualization';

export class TooltipEngine {
  /**
   * Generates a fully compiled dynamic tooltip model with proper styling configurations, accessibility tags and metrics comparison.
   */
  public static compile(
    title: string,
    items: {
      key: string;
      label: string;
      value: string | number;
      formattedValue: string;
      color: string;
    }[],
    options: {
      mode?: 'shared' | 'crosshair' | 'comparison';
    } = {}
  ): TooltipModel {
    const mode = options.mode || 'shared';
    const compiledItems: TooltipItem[] = items.map((it) => ({
      key: it.key,
      label: it.label,
      value: it.value,
      formattedValue: it.formattedValue,
      color: it.color,
    }));

    // Generate readable accessible label
    let ariaLabel = `Data details for ${title}. `;
    if (mode === 'comparison' && compiledItems.length >= 2) {
      ariaLabel += `Comparing: ${compiledItems.map(it => `${it.label} is ${it.formattedValue}`).join(' vs ')}.`;
    } else {
      ariaLabel += compiledItems.map(it => `${it.label}: ${it.formattedValue}`).join(', ');
    }

    return {
      title,
      items: compiledItems,
      accessibleLabel: ariaLabel,
    };
  }
}
