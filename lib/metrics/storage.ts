import { LRUCache } from 'lru-cache';
import { Metric } from './types';
import { backendLogger } from '@/lib/logger';

export class MetricsStorage {
  private cache: LRUCache<string, Metric[]>;

  constructor(maxEntries: number, ttl: number) {
    this.cache = new LRUCache({
      max: maxEntries,
      ttl,
    });

    backendLogger.info('Metrics storage initialized', {
      maxEntries,
      ttl
    });
  }

  public get(key: string): Metric[] {
    backendLogger.debug('Retrieving metrics from storage', { key });
    return this.cache.get(key) || [];
  }

  public set(key: string, metrics: Metric[]): void {
    backendLogger.debug('Setting metrics in storage', {
      key,
      metricsCount: metrics.length
    });

    try {
      this.cache.set(key, metrics);
    } catch (error) {
      backendLogger.error('Failed to set metrics in storage', {
        error,
        key
      });
      throw error;
    }
  }

  public append(key: string, metric: Metric): void {
    backendLogger.debug('Appending metric to storage', {
      key,
      metric
    });

    try {
      const metrics = this.get(key);
      metrics.push(metric);
      this.set(key, metrics);
    } catch (error) {
      backendLogger.error('Failed to append metric to storage', {
        error,
        key,
        metric
      });
      throw error;
    }
  }

  public clear(key: string): void {
    backendLogger.debug('Clearing metrics for key', { key });

    try {
      this.cache.delete(key);
    } catch (error) {
      backendLogger.error('Failed to clear metrics for key', {
        error,
        key
      });
      throw error;
    }
  }

  public clearAll(): void {
    backendLogger.debug('Clearing all metrics from storage');

    try {
      this.cache.clear();
    } catch (error) {
      backendLogger.error('Failed to clear all metrics', { error });
      throw error;
    }
  }

  public getKeys(): string[] {
    try {
      const keys = Array.from(this.cache.keys());
      backendLogger.debug('Retrieved storage keys', {
        keyCount: keys.length
      });
      return keys;
    } catch (error) {
      backendLogger.error('Failed to retrieve storage keys', { error });
      throw error;
    }
  }

  public cleanup(cutoff: number): void {
    backendLogger.debug('Starting metrics cleanup', { cutoff });

    try {
      const entries = Array.from(this.cache.entries());
      let cleanedCount = 0;

      entries.forEach(([key, values]) => {
        const filtered = values.filter(m => m.timestamp >= cutoff);
        if (filtered.length !== values.length) {
          this.set(key, filtered);
          cleanedCount++;
        }
      });

      backendLogger.info('Metrics cleanup completed', {
        cleanedKeys: cleanedCount,
        totalKeys: entries.length
      });
    } catch (error) {
      backendLogger.error('Failed to cleanup metrics', {
        error,
        cutoff
      });
      throw error;
    }
  }
}