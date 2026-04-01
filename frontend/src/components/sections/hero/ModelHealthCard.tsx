import { Activity, AlertTriangle, CheckCircle2, Radar } from "lucide-react";
import { HealthTrendSparkline } from "../../../charts/HealthTrendSparkline";
import type { ModelHealthMetric } from "../../../types/models";

type ModelHealthCardProps = {
  model: ModelHealthMetric;
};

function statusIcon(status: ModelHealthMetric["status"]) {
  if (status === "stable") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-300" />;
  }
  if (status === "elevated") {
    return <AlertTriangle className="h-4 w-4 text-amber-300" />;
  }
  return <Activity className="h-4 w-4 text-cyan-300" />;
}

function statusLabel(status: ModelHealthMetric["status"]) {
  if (status === "stable") {
    return "Mitigation Stable";
  }
  if (status === "elevated") {
    return "Bias Risk Elevated";
  }
  return "Proxy Drift Monitoring";
}

function metricPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function ModelHealthCard({ model }: ModelHealthCardProps) {
  return (
    <article className="app-card group relative overflow-hidden rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.16)] md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.08),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 md:text-base">{model.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{model.subtitle}</p>
          </div>
          <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-2">
            <Radar className="h-4 w-4 text-cyan-700" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Accuracy</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{metricPercent(model.accuracy)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Precision</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{metricPercent(model.precision)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Recall</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{metricPercent(model.recall)}</p>
          </div>
        </div>

        <div className="mt-4">
          <HealthTrendSparkline data={model.trend} />
        </div>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700">
          {statusIcon(model.status)}
          {statusLabel(model.status)}
        </div>
      </div>
    </article>
  );
}
