export type NarrativeStep = {
  id: number;
  title: string;
  model: "Model A" | "Model B" | "Model C";
  headline: string;
  description: string;
  insight: string;
  chips: string[];
  tone: "danger" | "warning" | "success";
};
