const tabs = [
  { label: "Overview", href: "#overview" },
  { label: "Global Audit", href: "#global-audit" },
  { label: "Local Audit", href: "#local-audit" },
  { label: "Roadmap", href: "#roadmap" },
];

export function SectionTabs() {
  return (
    <div className="border-b border-slate-200 bg-white/90 px-6 py-2 md:px-8">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <a
            key={tab.href}
            href={tab.href}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {tab.label}
          </a>
        ))}
      </div>
    </div>
  );
}
