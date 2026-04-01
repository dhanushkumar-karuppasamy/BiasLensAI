import { useState } from "react";
import BiasLensInvestigativeReport from "./BiasLensInvestigativeReport";
import InteractiveMitigationStudio from "./InteractiveMitigationStudio";

type TabKey = "report" | "studio";

export default function BiasLensWorkspace() {
  const [activeTab, setActiveTab] = useState<TabKey>("report");

  return (
    <div className="min-h-screen bg-white text-black">
      <nav className="sticky top-0 z-10 border-b border-black bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 md:px-10">
          <button
            type="button"
            onClick={() => setActiveTab("report")}
            className={`border border-black px-3 py-1 font-sans text-xs uppercase tracking-[0.14em] ${
              activeTab === "report" ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            Investigative Report
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className={`border border-black px-3 py-1 font-sans text-xs uppercase tracking-[0.14em] ${
              activeTab === "studio" ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            Interactive Mitigation Studio
          </button>
        </div>
      </nav>

      {activeTab === "report" ? <BiasLensInvestigativeReport /> : <InteractiveMitigationStudio />}
    </div>
  );
}
