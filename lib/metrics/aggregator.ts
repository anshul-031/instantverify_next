import { Metric, MetricSummary } from './types';
import { backendLogger } from '@/lib/logger';

export class MetricsAggregator {
  public static calculateSummary(metrics: Metric[]): MetricSummary {
    backendLogger.debug('Calculating metrics summary', {
      metricsCount: metrics.length
    });

    try {
      if (!metrics.length) {
        return {
          total: 0,
          average: 0,
          min: 0,
          max: 0,
          count: 0,
          lastValue: 0,
          lastTimestamp: 0,
        };
      }

      const values = metrics.map(m => m.value);
      const total = values.reduce((sum, val) => sum + val, 0);
      const lastMetric = metrics[metrics.length - 1];

      const summary = {
        total,
        average: total / metrics.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: metrics.length,
        lastValue: lastMetric.value,
        lastTimestamp: lastMetric.timestamp,
      };

      backendLogger.debug('Metrics summary calculated', summary);
      return summary;
    } catch (error) {
      backendLogger.error('Failed to calculate metrics summary', {
        error,
        metricsCount: metrics.length
      });
      throw error;
    }
  }

  public static aggregateByTimeWindow(
    metrics: Metric[],
    windowSize: number
  ): Metric[] {
    backendLogger.debug('Aggregating metrics by time window', {
      metricsCount: metrics.length,
      windowSize
    });

    try {
      const windows = new Map<number, Metric[]>();

      metrics.forEach(metric => {
        const windowStart = Math.floor(metric.timestamp / windowSize) * windowSize;
        const window = windows.get(windowStart) || [];
        window.push(metric);
        windows.set(windowStart, window);
      });

      const aggregated = Array.from(windows.entries()).map(([timestamp, windowMetrics]) => ({
        timestamp,
        value: windowMetrics.reduce((sum, m) => sum + m.value, 0),
        metadata: {
          count: windowMetrics.length,
          average: windowMetrics.reduce((sum, m) => sum + m.value, 0) / windowMetrics.length,
        },
      }));

      backendLogger.debug('Metrics aggregation completed', {
        originalCount: metrics.length,
        aggregatedCount: aggregated.length
      });

      return aggregated;
    } catch (error) {
      backendLogger.error('Failed to aggregate metrics by time window', {
        error,
        metricsCount: metrics.length,
        windowSize
      });
      throw error;
    }
  }
}