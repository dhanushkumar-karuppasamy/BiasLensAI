import { Rocket } from "lucide-react";
import { SectionContainer } from "../../layout/SectionContainer";
import { SectionHeader } from "../../shared/SectionHeader";
import { RoadmapBentoGrid } from "./RoadmapBentoGrid";

export function RoadmapSection() {
  return (
    <SectionContainer id="roadmap" className="pt-8 pb-24 md:pt-12 md:pb-28">
      <SectionHeader
        eyebrow="Section 4 · Enterprise Roadmap"
        title="BiasLens Platform Expansion: From Audit Tool to Operational Fairness Layer"
        description="Next capabilities focus on enterprise deployment, legal explainability, and proactive bias prevention in production model pipelines."
      />

      <RoadmapBentoGrid />

      <div className="mt-6 app-card rounded-2xl p-5 md:p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
          <Rocket className="h-3.5 w-3.5" />
          Roadmap Intent
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
          BiasLens is evolving into an always-on fairness observability platform where every model iteration is checked,
          explained, and governed before reaching real users.
        </p>
      </div>
    </SectionContainer>
  );
}
