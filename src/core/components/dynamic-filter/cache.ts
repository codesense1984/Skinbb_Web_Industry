/**
 * In-memory cache for loadOptions results
 */

import type { FilterOption } from "./types";

interface CacheEntry {
  data: FilterOption[];
  timestamp: number;
  query?: string;
}

class FilterCache {
  private cache = new Map<string, CacheEntry>();
  private ttl: number;

  constructor(ttl: number = 5 * 60 * 1000) {
    // Default 5 minutes TTL
    this.ttl = ttl;
  }

  /**
   * Generate cache key from dataKey and optional query
   */
  private getKey(dataKey: string, query?: string): string {
    return query ? `${dataKey}:${query}` : dataKey;
  }

  /**
   * Get cached data if valid
   */
  get(dataKey: string, query?: string): FilterOption[] | null {
    const key = this.getKey(dataKey, query);
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cache entry
   */
  set(dataKey: string, data: FilterOption[], query?: string): void {
    const key = this.getKey(dataKey, query);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      query,
    });
  }

  /**
   * Clear cache for a specific dataKey (all queries)
   */
  clear(dataKey: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${dataKey}:`) || key === dataKey) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Singleton instance
let globalCache: FilterCache | null = null;

/**
 * Get or create the global cache instance
 */
export function getCache(ttl?: number): FilterCache {
  if (!globalCache) {
    globalCache = new FilterCache(ttl);
  }
  return globalCache;
}

/**
 * Reset the global cache (useful for testing)
 */
export function resetCache(): void {
  globalCache = null;
}
