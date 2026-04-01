export type ModelKey = "A" | "B" | "C";

export type ModelHealthMetric = {
  key: ModelKey;
  title: string;
  subtitle: string;
  accuracy: number;
  precision: number;
  recall: number;
  trend: Array<{ idx: number; score: number }>;
  status: "monitoring" | "elevated" | "stable";
};
