import { Bot, FileSpreadsheet, Lock, ScanSearch } from "lucide-react";
import type { RoadmapFeature } from "../../../types/roadmap";

type RoadmapFeatureCardProps = {
  feature: RoadmapFeature;
};

function iconFor(title: string) {
  if (title.includes("CSV")) return <FileSpreadsheet className="h-4 w-4" />;
  if (title.includes("LLM")) return <Bot className="h-4 w-4" />;
  if (title.includes("Firewall")) return <Lock className="h-4 w-4" />;
  return <ScanSearch className="h-4 w-4" />;
}

function accentClasses(accent: RoadmapFeature["accent"]) {
  if (accent === "violet") return "border-violet-200/20 bg-violet-300/10 text-violet-100";
  if (accent === "amber") return "border-amber-200/20 bg-amber-300/10 text-amber-100";
  if (accent === "emerald") return "border-emerald-200/20 bg-emerald-300/10 text-emerald-100";
  return "border-cyan-200/20 bg-cyan-300/10 text-cyan-100";
}

export function RoadmapFeatureCard({ feature }: RoadmapFeatureCardProps) {
  return (
    <article
      className={`app-card rounded-2xl p-5 md:p-6 ${feature.size === "lg" ? "md:col-span-2" : "md:col-span-1"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-xl border p-2 ${accentClasses(feature.accent)}`}>{iconFor(feature.title)}</div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700">
          ETA {feature.eta}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 md:text-lg">{feature.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
    </article>
  );
}
