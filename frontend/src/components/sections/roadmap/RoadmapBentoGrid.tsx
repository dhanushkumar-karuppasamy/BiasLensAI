import { roadmapFeatures } from "../../../data/roadmap.mock";
import { RoadmapFeatureCard } from "./RoadmapFeatureCard";

export function RoadmapBentoGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {roadmapFeatures.map((feature) => (
        <RoadmapFeatureCard key={feature.title} feature={feature} />
      ))}
    </div>
  );
}
