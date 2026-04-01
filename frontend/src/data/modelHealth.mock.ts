import type { ModelHealthMetric } from "../types/models";

export const modelHealthData: ModelHealthMetric[] = [
  {
    key: "A",
    title: "Model A · Overt Bias",
    subtitle: "Protected attributes included",
    accuracy: 0.874,
    precision: 0.778,
    recall: 0.651,
    status: "elevated",
    trend: [
      { idx: 1, score: 0.852 },
      { idx: 2, score: 0.861 },
      { idx: 3, score: 0.869 },
      { idx: 4, score: 0.873 },
      { idx: 5, score: 0.874 },
    ],
  },
  {
    key: "B",
    title: "Model B · Proxy Bias",
    subtitle: "Sex/Race removed; proxy pathways active",
    accuracy: 0.873,
    precision: 0.778,
    recall: 0.65,
    status: "monitoring",
    trend: [
      { idx: 1, score: 0.851 },
      { idx: 2, score: 0.86 },
      { idx: 3, score: 0.868 },
      { idx: 4, score: 0.872 },
      { idx: 5, score: 0.873 },
    ],
  },
  {
    key: "C",
    title: "Model C · Mitigated Bias",
    subtitle: "Pre-processing fairness reweighting",
    accuracy: 0.871,
    precision: 0.771,
    recall: 0.668,
    status: "stable",
    trend: [
      { idx: 1, score: 0.846 },
      { idx: 2, score: 0.857 },
      { idx: 3, score: 0.864 },
      { idx: 4, score: 0.869 },
      { idx: 5, score: 0.871 },
    ],
  },
];
