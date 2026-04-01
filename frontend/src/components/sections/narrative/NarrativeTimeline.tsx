import { narrativeSteps } from "../../../data/narrativeSteps.mock";
import { NarrativeStepCard } from "./NarrativeStepCard";

export function NarrativeTimeline() {
  return (
    <div className="relative space-y-5 pl-4 before:absolute before:bottom-3 before:left-0.5 before:top-3 before:w-px before:bg-gradient-to-b before:from-cyan-200/60 before:via-violet-200/40 before:to-emerald-200/60">
      {narrativeSteps.map((step) => (
        <NarrativeStepCard key={step.id} step={step} />
      ))}
    </div>
  );
}
