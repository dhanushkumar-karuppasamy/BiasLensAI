import { modelHealthData } from "../../../data/modelHealth.mock";
import { ModelHealthCard } from "./ModelHealthCard";

export function ModelHealthStrip() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr_0.95fr]">
      {modelHealthData.map((model) => (
        <ModelHealthCard key={model.key} model={model} />
      ))}
    </div>
  );
}
