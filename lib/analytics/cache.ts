export interface CacheEntry<T> {
  data: T;
  cachedAt: number; // timestamp
  expiresAt: number; // timestamp
  viewVersion: string;
}

export class AnalyticsCache {
  private static memoryCache: Map<string, CacheEntry<any>> = new Map();
  private static defaultTTLMs = 5 * 60 * 1000; // 5 minutes default

  // Simple key generator
  public static makeKey(viewId: string, athleteId: string, extraId = ''): string {
    return `${viewId}::${athleteId}${extraId ? '::' + extraId : ''}`;
  }

  /**
   * Retrieves an item from the cache based on configuration policies.
   */
  public static get<T>(key: string, policy: 'memory' | 'session' | 'none' = 'memory'): T | null {
    if (policy === 'none') return null;

    // 1. Try Memory Cache
    const memEntry = this.memoryCache.get(key);
    if (memEntry) {
      if (Date.now() < memEntry.expiresAt) {
        return memEntry.data as T;
      } else {
        this.memoryCache.delete(key); // Expired
      }
    }

    // 2. Try Session Cache (browser only)
    if (policy === 'session' && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const stored = sessionStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored) as CacheEntry<T>;
          if (Date.now() < parsed.expiresAt) {
            // Also sync back to memory cache
            this.memoryCache.set(key, parsed);
            return parsed.data;
          } else {
            sessionStorage.removeItem(key); // Expired
          }
        }
      } catch (err) {
        console.warn('[AnalyticsCache] Session Storage read failed:', err);
      }
    }

    return null;
  }

  /**
   * Saves an item to the cache based on policies.
   */
  public static set<T>(
    key: string,
    data: T,
    policy: 'memory' | 'session' | 'none' = 'memory',
    viewVersion = '1.0.0',
    ttlMs = this.defaultTTLMs
  ): void {
    if (policy === 'none') return;

    const entry: CacheEntry<T> = {
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
      viewVersion,
    };

    // 1. Set Memory Cache
    this.memoryCache.set(key, entry);

    // 2. Set Session Cache (browser only)
    if (policy === 'session' && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem(key, JSON.stringify(entry));
      } catch (err) {
        console.warn('[AnalyticsCache] Session Storage write failed:', err);
      }
    }
  }

  /**
   * Invalidates specific cache keys or all caches matching a pattern.
   */
  public static invalidate(pattern: string): void {
    // Memory Cache invalidation
    for (const key of Array.from(this.memoryCache.keys())) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Session Cache invalidation (browser only)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i);
          if (key && key.includes(pattern)) {
            sessionStorage.removeItem(key);
          }
        }
      } catch (err) {
        console.warn('[AnalyticsCache] Session Storage invalidation failed:', err);
      }
    }
  }

  /**
   * Completely clears all memory caches.
   */
  public static clearAll(): void {
    this.memoryCache.clear();
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn('[AnalyticsCache] Failed to clear sessionStorage:', e);
      }
    }
  }

  /**
   * Simulates a future Firestore storage cache capability
   * (saves serializable JSON to a dedicated caching collection).
   */
  public static async saveToFirestoreCache(
    athleteId: string,
    viewId: string,
    data: any
  ): Promise<boolean> {
    // In the future this can write to `users/{athleteId}/cached_view_models/{viewId}`
    // For now we trace this log mock for future expansion
    console.log(`[AnalyticsCache] [FirestoreMock] Caching View Model ${viewId} for Athlete ${athleteId}`);
    return true;
  }
}
