export interface RateLimitStatus {
  isLimited: boolean;
  retryAfterSeconds: number;
  reason: string;
}

export class RateLimitEngine {
  private static DEFAULT_COOLDOWN_SECONDS = 60;
  private static MAX_BACKOFF_SECONDS = 900; // 15 minutes limit

  /**
   * Evaluates HTTP status code and headers to detect rate-limiting conditions.
   */
  static detect(statusCode: number, headers?: Record<string, string>): RateLimitStatus {
    const normHeaders = this.normalizeHeaders(headers || {});

    // Standard rate limit codes
    if (statusCode === 429) {
      let retryAfter = this.parseRetryAfterHeader(normHeaders);
      
      // Look for vendor-specific headers (Strava uses X-Read-Rate-Limit, etc.)
      const stravaUsage = normHeaders['x-read-ratelimit-usage'] || normHeaders['x-ratelimit-usage'];
      const details = stravaUsage ? `Usage: ${stravaUsage}` : 'Endpoint hit limit threshold.';

      return {
        isLimited: true,
        retryAfterSeconds: retryAfter || this.DEFAULT_COOLDOWN_SECONDS,
        reason: `429 Too Many Requests. ${details}`
      };
    }

    // Check custom headers for high rate-limit usage (e.g. over 95% full)
    const stravaLimit = normHeaders['x-read-ratelimit-limit'];
    const stravaUsage = normHeaders['x-read-ratelimit-usage'];
    if (stravaLimit && stravaUsage) {
      const limits = stravaLimit.split(',').map(Number);
      const usages = stravaUsage.split(',').map(Number);
      
      for (let i = 0; i < limits.length; i++) {
        if (limits[i] > 0 && usages[i] / limits[i] >= 0.98) {
          return {
            isLimited: true,
            retryAfterSeconds: 300, // 5 minutes proactive cooldown
            reason: `Proactive rate safety: Endpoint usage at ${(usages[i] / limits[i] * 100).toFixed(1)}% of allowance.`
          };
        }
      }
    }

    return {
      isLimited: false,
      retryAfterSeconds: 0,
      reason: ''
    };
  }

  /**
   * Calculates backoff duration using exponential backoff with full jitter.
   */
  static getBackoffWithJitter(retryCount: number, retryAfterSeconds = 0): number {
    if (retryAfterSeconds > 0) {
      // If server specified Retry-After, respect it but add a small jitter up to 1.5s
      return (retryAfterSeconds + Math.random() * 1.5) * 1000;
    }

    // Exponential Backoff base calculation (2^retryCount)
    const base = Math.pow(2, retryCount);
    const temp = Math.min(this.MAX_BACKOFF_SECONDS, base);
    
    // Apply Full Jitter: random value between 0 and temp
    const jitterFactor = Math.random();
    const backoffSeconds = temp * jitterFactor;

    // Minimum 1 second, capped at max backoff
    return Math.max(1, backoffSeconds) * 1000;
  }

  /**
   * Helper to parse Retry-After header.
   */
  private static parseRetryAfterHeader(headers: Record<string, string>): number | null {
    const val = headers['retry-after'];
    if (!val) return null;

    // Retry-After can be seconds or a full HTTP-date
    if (/^\d+$/.test(val)) {
      return parseInt(val, 10);
    }

    const dateMs = Date.parse(val);
    if (!isNaN(dateMs)) {
      const delay = Math.max(0, (dateMs - Date.now()) / 1000);
      return Math.ceil(delay);
    }

    return null;
  }

  /**
   * Helper to lower-case header keys.
   */
  private static normalizeHeaders(headers: Record<string, string>): Record<string, string> {
    const res: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      res[k.toLowerCase()] = v;
    }
    return res;
  }
}
