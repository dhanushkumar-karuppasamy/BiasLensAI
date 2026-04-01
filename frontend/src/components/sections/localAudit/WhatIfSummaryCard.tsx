type WhatIfSummaryCardProps = {
  label: string;
  score: number;
};

export function WhatIfSummaryCard({ label, score }: WhatIfSummaryCardProps) {
  const pct = `${(score * 100).toFixed(1)}%`;
  const riskLabel = score >= 0.6 ? "Likely >50K" : score >= 0.45 ? "Borderline" : "Likely <=50K";

  return (
    <div className="app-card rounded-2xl p-5 md:p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Selected Counterfactual</p>
      <h3 className="mt-2 text-lg font-semibold text-slate-900">{label}</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Predicted Probability</p>
          <p className="mt-1 text-2xl font-semibold text-cyan-700">{pct}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Outcome Band</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{riskLabel}</p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        This local explanation shows how proxy-correlated features can still create penalties after protected columns
        are removed.
      </p>
    </div>
  );
}
