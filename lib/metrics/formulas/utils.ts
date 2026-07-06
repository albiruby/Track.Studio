/**
 * Sports Science Metric Engine - Math and Conversion Utilities
 */

/**
 * Converts meters per second to pace (minutes per kilometer in decimal).
 * E.g., 4.0 m/s -> 4.1667 (which is 4:10/km)
 */
export function mpsToDecimalPace(mps: number | null | undefined): number {
  if (!mps || mps <= 0) return 0;
  const paceSecPerKm = 1000 / mps;
  return parseFloat((paceSecPerKm / 60).toFixed(4));
}

/**
 * Calculates the mean of a number array, filtering out null/undefined/NaN.
 */
export function calculateMean(arr: (number | null | undefined)[]): number {
  const clean = arr.filter((x): x is number => typeof x === 'number' && !isNaN(x));
  if (clean.length === 0) return 0;
  const sum = clean.reduce((a, b) => a + b, 0);
  return sum / clean.length;
}

/**
 * Calculates the variance of a number array.
 */
export function calculateVariance(arr: (number | null | undefined)[]): number {
  const clean = arr.filter((x): x is number => typeof x === 'number' && !isNaN(x));
  if (clean.length <= 1) return 0;
  const mean = calculateMean(clean);
  const sumSqDiff = clean.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  return sumSqDiff / clean.length; // population variance
}

/**
 * Calculates the standard deviation of a number array.
 */
export function calculateStandardDeviation(arr: (number | null | undefined)[]): number {
  return Math.sqrt(calculateVariance(arr));
}

/**
 * Calculates coefficient of variation (CV = SD / Mean). Returns 0 if mean is 0.
 */
export function calculateCV(arr: (number | null | undefined)[]): number {
  const mean = calculateMean(arr);
  if (mean === 0) return 0;
  const sd = calculateStandardDeviation(arr);
  return sd / mean;
}

/**
 * Calculates a rolling average of an array with window size k.
 */
export function rollingAverage(arr: number[], k: number): number[] {
  if (k <= 1 || arr.length === 0) return [...arr];
  const result: number[] = [];
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (i >= k) {
      sum -= arr[i - k];
    }
    const divisor = Math.min(i + 1, k);
    result.push(sum / divisor);
  }
  return result;
}

/**
 * Safely parse numeric date strings to timestamps.
 */
export function parseToTimestamp(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? 0 : parsed;
}
