import { AxisModel, AxisScaleType } from '@/types/visualization';

export class AxisEngine {
  /**
   * Generates a fully formatted Axis model with custom scale configuration, tick calculations, and density boundaries.
   */
  public static generateAxis(
    key: string,
    type: AxisScaleType,
    label: string,
    values: (number | string)[],
    options: {
      tickDensity?: 'high' | 'medium' | 'low';
      min?: number;
      max?: number;
    } = {}
  ): AxisModel {
    const tickDensity = options.tickDensity || 'medium';
    let computedMin = options.min;
    let computedMax = options.max;
    let computedTicks: (string | number)[] = [];

    if (type === 'linear' || type === 'logarithmic') {
      const numericValues = values.map(Number).filter(v => !isNaN(v));
      if (numericValues.length > 0) {
        if (computedMin === undefined) {
          computedMin = Math.min(...numericValues);
        }
        if (computedMax === undefined) {
          computedMax = Math.max(...numericValues);
        }

        computedTicks = this.calculateNumericTicks(computedMin, computedMax, tickDensity, type);
      }
    } else {
      // For Time, Ordinal, and Categorical, select subset of keys based on density
      computedTicks = this.calculateOrdinalTicks(values, tickDensity);
    }

    return {
      key,
      type,
      label,
      min: computedMin,
      max: computedMax,
      ticks: computedTicks,
      tickDensity,
    };
  }

  private static calculateNumericTicks(
    min: number,
    max: number,
    density: 'high' | 'medium' | 'low',
    scale: 'linear' | 'logarithmic'
  ): number[] {
    if (min === max) {
      return [min];
    }

    const count = density === 'high' ? 10 : density === 'medium' ? 5 : 3;
    const ticks: number[] = [];

    if (scale === 'linear') {
      const step = (max - min) / (count - 1);
      for (let i = 0; i < count; i++) {
        ticks.push(Number((min + step * i).toFixed(2)));
      }
    } else {
      // Logarithmic ticks
      const logMin = Math.log10(min <= 0 ? 0.1 : min);
      const logMax = Math.log10(max <= 0 ? 1 : max);
      const step = (logMax - logMin) / (count - 1);
      for (let i = 0; i < count; i++) {
        ticks.push(Number(Math.pow(10, logMin + step * i).toFixed(2)));
      }
    }

    return ticks;
  }

  private static calculateOrdinalTicks(
    values: (string | number)[],
    density: 'high' | 'medium' | 'low'
  ): (string | number)[] {
    if (values.length === 0) return [];
    
    const count = density === 'high' ? values.length : density === 'medium' ? Math.ceil(values.length / 2) : Math.ceil(values.length / 4);
    if (count >= values.length) {
      return [...values];
    }

    const step = Math.ceil(values.length / count);
    const ticks: (string | number)[] = [];
    for (let i = 0; i < values.length; i += step) {
      ticks.push(values[i]);
    }

    // Always include the last item if it's not already there
    if (ticks[ticks.length - 1] !== values[values.length - 1]) {
      ticks.push(values[values.length - 1]);
    }

    return ticks;
  }
}
