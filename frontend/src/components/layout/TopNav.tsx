import { ShieldCheck, Sparkles } from "lucide-react";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-2">
            <ShieldCheck className="h-4 w-4 text-cyan-700" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-slate-900">BiasLens AI</p>
        </div>

        <a
          href="#roadmap"
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Platform Roadmap
        </a>
      </div>
    </header>
  );
}
