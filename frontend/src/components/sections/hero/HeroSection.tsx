import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import { SectionContainer } from "../../layout/SectionContainer";
import { ModelHealthStrip } from "./ModelHealthStrip";

export function HeroSection() {
  return (
    <SectionContainer id="overview" className="pt-8 md:pt-10">
      <div className="grid items-start gap-8 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium tracking-wide text-cyan-700">
            <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
            BiasLens Platform
          </p>

          <h1 className="overflow-x-auto whitespace-nowrap text-4xl font-semibold leading-tight text-gradient-subtle md:text-6xl">
            BiasLens AI: Algorithmic Fairness & Intersectional Auditing Platform
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            Before auditing bias, we verify model health. The baseline metrics stay near 87% accuracy while
            exposing where overt, proxy, and mitigated fairness behaviors diverge under scrutiny.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#global-audit"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open Global Audit
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Enterprise-ready fairness instrumentation
            </div>
          </div>
        </div>

        <aside className="app-card rounded-2xl p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Narrative Start</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Model Health Checkpoint</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            These metrics establish predictive reliability before we move into global bias patterns and
            intersectional local explanations.
          </p>

          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span>Model A · Overt Bias</span>
              <span className="font-semibold text-amber-700">87.4%</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span>Model B · Proxy Bias</span>
              <span className="font-semibold text-cyan-700">87.3%</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span>Model C · Mitigated Bias</span>
              <span className="font-semibold text-emerald-700">87.1%</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8 md:mt-10">
        <ModelHealthStrip />
      </div>
    </SectionContainer>
  );
}
