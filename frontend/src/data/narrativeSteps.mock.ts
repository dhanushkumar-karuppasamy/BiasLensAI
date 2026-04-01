import type { NarrativeStep } from "../types/narrative";

export const narrativeSteps: NarrativeStep[] = [
  {
    id: 1,
    title: "Overt Bias",
    model: "Model A",
    headline: "Protected attributes create direct penalties",
    description:
      "When sex and race are included directly, minority applicants can receive mathematically unfavorable scores before any nuanced context is considered.",
    insight:
      "Observed effect: higher rejection pressure concentrated in explicitly protected groups.",
    chips: ["Sex", "Race", "Direct Signal"],
    tone: "danger",
  },
  {
    id: 2,
    title: "Colorblind Fallacy",
    model: "Model B",
    headline: "Bias reroutes through proxy variables",
    description:
      "Removing protected columns does not remove correlated structure. Features such as marital status and relationship silently absorb demographic signal.",
    insight:
      "Observed effect: fairness gaps persist despite near-identical model accuracy.",
    chips: ["Marital Status", "Relationship", "Proxy Pathway"],
    tone: "warning",
  },
  {
    id: 3,
    title: "Mitigated Model",
    model: "Model C",
    headline: "Pre-processing fairness reweighting neutralizes proxies",
    description:
      "By reweighting underrepresented samples before training, proxy-driven penalties are dampened while predictive quality remains strong.",
    insight:
      "Observed effect: reduced disparity with minimal performance trade-off.",
    chips: ["Sample Reweighting", "Proxy Dampening", "Balanced Outcomes"],
    tone: "success",
  },
];
