import { MoveRight } from "lucide-react";
import { ProxySignalShiftChart } from "../../../charts/ProxySignalShiftChart";
import { SectionHeader } from "../../shared/SectionHeader";
import { SectionContainer } from "../../layout/SectionContainer";
import { NarrativeTimeline } from "./NarrativeTimeline";

const comparisonRows = [
  { metric: "Accuracy", modelA: "87.4%", modelB: "87.3%", modelC: "87.1%" },
  { metric: "Precision", modelA: "77.8%", modelB: "77.8%", modelC: "77.1%" },
  { metric: "Recall", modelA: "65.1%", modelB: "65.0%", modelC: "66.8%" },
  { metric: "Demographic Parity Gap", modelA: "0.19", modelB: "0.17", modelC: "0.09" },
  { metric: "Equal Opportunity Gap", modelA: "0.16", modelB: "0.15", modelC: "0.08" },
];

export function GlobalAuditSection() {
  return (
    <SectionContainer id="global-audit" className="pt-8 md:pt-12">
      <SectionHeader
        eyebrow="Section 2 · Global Audit"
        title="The Core Narrative: How Bias Evolves Across Models"
        description="This comparative timeline shows the transition from explicit demographic dependence to hidden proxy behavior, and finally to mitigation through fairness-aware pre-processing."
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1.2fr_0.95fr]">
        <NarrativeTimeline />

        <div className="space-y-5 xl:sticky xl:top-24">
          <ProxySignalShiftChart />
          <div className="app-card rounded-2xl p-5 md:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Interpretation</p>
            <h3 className="mt-2 text-base font-semibold text-slate-900 md:text-lg">Colorblind ≠ Fair</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Model B preserves performance but still fails fairness checks because demographic information leaks through
              correlated features. Model C reduces this leakage while retaining high utility.
            </p>
            <a
              href="#explicit-comparison"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-900 transition hover:text-slate-700"
            >
              Compare fairness metrics
              <MoveRight className="h-4 w-4" />
            </a>
          </div>

          <div id="explicit-comparison" className="app-card rounded-2xl p-5 md:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Explicit Comparison</p>
            <h3 className="mt-2 text-base font-semibold text-slate-900 md:text-lg">Model A vs B vs C</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Performance remains close across models, but fairness gaps decline materially in Model C after
              pre-processing mitigation.
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Metric</th>
                    <th className="px-3 py-2 font-semibold">Model A</th>
                    <th className="px-3 py-2 font-semibold">Model B</th>
                    <th className="px-3 py-2 font-semibold">Model C</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.metric} className="border-t border-slate-200 text-slate-700">
                      <td className="px-3 py-2 font-medium">{row.metric}</td>
                      <td className="px-3 py-2">{row.modelA}</td>
                      <td className="px-3 py-2">{row.modelB}</td>
                      <td className="px-3 py-2 font-semibold text-emerald-700">{row.modelC}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
