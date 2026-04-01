import type { RoadmapFeature } from "../types/roadmap";

export const roadmapFeatures: RoadmapFeature[] = [
  {
    title: "Custom CSV Uploads",
    description: "Audit internal HR, lending, or hiring datasets with the same fairness workflow used in BiasLens.",
    accent: "cyan",
    size: "lg",
    eta: "Q2",
  },
  {
    title: "LLM Compliance Reports",
    description: "Auto-convert SHAP + fairness metrics into plain-English PDF reports for legal and governance teams.",
    accent: "violet",
    size: "sm",
    eta: "Q2",
  },
  {
    title: "CI/CD Bias Firewall",
    description: "Gate model deployments when disparate impact or equal opportunity thresholds are violated.",
    accent: "amber",
    size: "sm",
    eta: "Q3",
  },
  {
    title: "Auto-Proxy Detection",
    description: "Automatically flag hidden proxy variables (zip code, title, location) before model release.",
    accent: "emerald",
    size: "lg",
    eta: "Q3",
  },
];
