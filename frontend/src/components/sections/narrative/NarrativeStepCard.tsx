import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import type { NarrativeStep } from "../../../types/narrative";

type NarrativeStepCardProps = {
  step: NarrativeStep;
};

function toneMeta(tone: NarrativeStep["tone"]) {
  if (tone === "danger") {
    return {
      icon: <ShieldAlert className="h-4 w-4 text-rose-300" />,
      badge: "High Harm Potential",
      badgeClass: "border-rose-200/20 bg-rose-300/10 text-rose-100",
    };
  }
  if (tone === "warning") {
    return {
      icon: <AlertTriangle className="h-4 w-4 text-amber-300" />,
      badge: "Proxy Drift Active",
      badgeClass: "border-amber-200/20 bg-amber-300/10 text-amber-100",
    };
  }
  return {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-300" />,
    badge: "Mitigation Working",
    badgeClass: "border-emerald-200/20 bg-emerald-300/10 text-emerald-100",
  };
}

export function NarrativeStepCard({ step }: NarrativeStepCardProps) {
  const meta = toneMeta(step.tone);

  return (
    <article className="app-card relative rounded-2xl p-5 md:p-6">
      <div className="absolute -left-2 top-8 h-3 w-3 rounded-full bg-slate-900 shadow-[0_0_0_6px_rgba(148,163,184,0.18)]" />
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
          Step {step.id}
        </span>
        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700">
          {step.model}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
      <p className="mt-1 text-sm text-slate-700">{step.headline}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {step.chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.badgeClass}`}>
        {meta.icon}
        {meta.badge}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">{step.insight}</p>
    </article>
  );
}
