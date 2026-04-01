import { BarChart3, FileText, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";

const nav = [
  { label: "Overview", icon: LayoutDashboard, href: "#overview" },
  { label: "Global Audit", icon: BarChart3, href: "#global-audit" },
  { label: "Local Audit", icon: ShieldCheck, href: "#local-audit" },
  { label: "Roadmap", icon: FileText, href: "#roadmap" },
];

export function AppSidebar() {
  return (
    <aside className="hidden border-r border-slate-200/80 bg-white lg:block lg:w-[240px]">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
        <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-1.5">
          <ShieldCheck className="h-4 w-4 text-cyan-700" />
        </div>
        <span className="text-sm font-semibold text-slate-900">BiasLens AI</span>
      </div>

      <div className="px-3 py-4">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Research Studio</p>
        <nav className="mt-3 space-y-1">
          {nav.map(({ label, icon: Icon, href }, idx) => (
            <a
              key={label}
              href={href}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                idx === 0
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </a>
          ))}
        </nav>

        <div className="mt-8 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-medium text-indigo-700">
            <Sparkles className="h-3 w-3" />
            Platform Navigation
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Jump directly to each audit stage using section anchors.
          </p>
        </div>
      </div>
    </aside>
  );
}
