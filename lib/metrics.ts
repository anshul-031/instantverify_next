import { LRUCache } from "lru-cache";

interface Metric {
  value: number;
  timestamp: number;
}

class Metrics {
  private cache: LRUCache<string, Metric[]>;
  private readonly retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.cache = new LRUCache({
      max: 1000, // Maximum number of metrics to track
      ttl: this.retentionPeriod,
    });
  }

  public trackApiCall(endpoint: string, responseTime: number, status: number) {
    const key = `api_${endpoint}_${status}`;
    const metrics = this.cache.get(key) || [];
    metrics.push({
      value: responseTime,
      timestamp: Date.now(),
    });
    this.cache.set(key, metrics);
  }

  public trackVerification(type: string, success: boolean) {
    const key = `verification_${type}_${success ? "success" : "failure"}`;
    const metrics = this.cache.get(key) || [];
    metrics.push({
      value: 1,
      timestamp: Date.now(),
    });
    this.cache.set(key, metrics);
  }

  public getMetrics(
    type: string,
    period: number = this.retentionPeriod
  ): Record<string, number> {
    const now = Date.now();
    const cutoff = now - period;
    const metrics: Record<string, number> = {};

    // Convert cache entries to array and iterate
    const entries = Array.from(this.cache.entries());

    entries.forEach(([key, values]) => {
      if (key.startsWith(type)) {
        metrics[key] = values
          .filter(m => m.timestamp >= cutoff)
          .reduce((sum, m) => sum + m.value, 0);
      }
    });

    return metrics;
  }

  public clearOldMetrics() {
    const cutoff = Date.now() - this.retentionPeriod;

    // Convert cache entries to array and iterate
    const entries = Array.from(this.cache.entries());

    entries.forEach(([key, values]) => {
      const filtered = values.filter(m => m.timestamp >= cutoff);
      if (filtered.length !== values.length) {
        this.cache.set(key, filtered);
      }
    });
  }
}

export const metrics = new Metrics();
