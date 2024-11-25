export interface Metric {
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface MetricSummary {
  total: number;
  average: number;
  min: number;
  max: number;
  count: number;
  lastValue: number;
  lastTimestamp: number;
}

export type MetricType = "api" | "verification" | "payment" | "user";

export interface MetricsOptions {
  maxEntries?: number;
  retentionPeriod?: number;
  enableAggregation?: boolean;
}
