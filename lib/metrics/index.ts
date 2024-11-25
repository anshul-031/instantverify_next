import { MetricsStorage } from "./storage";
import { MetricsAggregator } from "./aggregator";
import { Metric, MetricSummary, MetricType, MetricsOptions } from "./types";
import { backendLogger } from "@/lib/logger";

export class Metrics {
  private storage: MetricsStorage;
  private readonly retentionPeriod: number;
  private readonly enableAggregation: boolean;

  constructor(options: MetricsOptions = {}) {
    this.retentionPeriod = options.retentionPeriod || 24 * 60 * 60 * 1000; // 24 hours
    this.enableAggregation = options.enableAggregation ?? true;
    this.storage = new MetricsStorage(
      options.maxEntries || 1000,
      this.retentionPeriod
    );

    backendLogger.info("Metrics system initialized", {
      retentionPeriod: this.retentionPeriod,
      enableAggregation: this.enableAggregation,
      maxEntries: options.maxEntries || 1000,
    });
  }

  public trackApiCall(
    endpoint: string,
    responseTime: number,
    status: number,
    metadata?: Record<string, any>
  ) {
    const key = `api_${endpoint}_${status}`;
    backendLogger.debug("Tracking API call", {
      endpoint,
      responseTime,
      status,
      metadata,
    });

    try {
      this.storage.append(key, {
        value: responseTime,
        timestamp: Date.now(),
        metadata,
      });
    } catch (error) {
      backendLogger.error("Failed to track API call", {
        error,
        endpoint,
        status,
      });
    }
  }

  public trackVerification(
    type: string,
    success: boolean,
    metadata?: Record<string, any>
  ) {
    const key = `verification_${type}_${success ? "success" : "failure"}`;
    backendLogger.debug("Tracking verification", {
      type,
      success,
      metadata,
    });

    try {
      this.storage.append(key, {
        value: 1,
        timestamp: Date.now(),
        metadata,
      });
    } catch (error) {
      backendLogger.error("Failed to track verification", {
        error,
        type,
        success,
      });
    }
  }

  public trackCustomMetric(
    type: MetricType,
    name: string,
    value: number,
    metadata?: Record<string, any>
  ) {
    const key = `${type}_${name}`;
    backendLogger.debug("Tracking custom metric", {
      type,
      name,
      value,
      metadata,
    });

    try {
      this.storage.append(key, {
        value,
        timestamp: Date.now(),
        metadata,
      });
    } catch (error) {
      backendLogger.error("Failed to track custom metric", {
        error,
        type,
        name,
      });
    }
  }

  public getMetrics(
    type: string,
    period: number = this.retentionPeriod
  ): Record<string, MetricSummary> {
    backendLogger.debug("Retrieving metrics", {
      type,
      period,
    });

    try {
      const now = Date.now();
      const cutoff = now - period;
      const metrics: Record<string, MetricSummary> = {};

      const entries = Array.from(this.storage.getKeys());

      entries.forEach(key => {
        if (key.startsWith(type)) {
          const values = this.storage
            .get(key)
            .filter(m => m.timestamp >= cutoff);
          metrics[key] = MetricsAggregator.calculateSummary(values);
        }
      });

      backendLogger.debug("Retrieved metrics successfully", {
        type,
        metricsCount: Object.keys(metrics).length,
      });

      return metrics;
    } catch (error) {
      backendLogger.error("Failed to retrieve metrics", {
        error,
        type,
        period,
      });
      return {};
    }
  }

  public getTimeSeriesMetrics(
    type: string,
    period: number = this.retentionPeriod,
    windowSize: number = 60000 // 1 minute default
  ): Record<string, Metric[]> {
    backendLogger.debug("Retrieving time series metrics", {
      type,
      period,
      windowSize,
    });

    try {
      const now = Date.now();
      const cutoff = now - period;
      const metrics: Record<string, Metric[]> = {};

      const entries = Array.from(this.storage.getKeys());

      entries.forEach(key => {
        if (key.startsWith(type)) {
          const values = this.storage
            .get(key)
            .filter(m => m.timestamp >= cutoff);
          metrics[key] = this.enableAggregation
            ? MetricsAggregator.aggregateByTimeWindow(values, windowSize)
            : values;
        }
      });

      backendLogger.debug("Retrieved time series metrics successfully", {
        type,
        metricsCount: Object.keys(metrics).length,
      });

      return metrics;
    } catch (error) {
      backendLogger.error("Failed to retrieve time series metrics", {
        error,
        type,
        period,
        windowSize,
      });
      return {};
    }
  }

  public clearOldMetrics(): void {
    backendLogger.debug("Clearing old metrics");

    try {
      const cutoff = Date.now() - this.retentionPeriod;
      this.storage.cleanup(cutoff);
      backendLogger.info("Old metrics cleared successfully");
    } catch (error) {
      backendLogger.error("Failed to clear old metrics", { error });
    }
  }

  public reset(): void {
    backendLogger.info("Resetting metrics system");

    try {
      this.storage.clearAll();
      backendLogger.info("Metrics system reset successfully");
    } catch (error) {
      backendLogger.error("Failed to reset metrics system", { error });
    }
  }
}

export const metrics = new Metrics();

export * from "./types";
