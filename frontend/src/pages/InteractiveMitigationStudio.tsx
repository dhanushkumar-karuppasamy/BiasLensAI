import { Fragment, useEffect, useMemo, useState } from "react";
import DataSourceBadge from "../components/shared/DataSourceBadge";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TradeoffResponse = {
  mitigation_weight: number;
  accuracy: number;
  demographic_parity: number;
};

type ProxyImpactPoint = {
  name: string;
  value: number;
};

type ProxySquashResponse = {
  unmitigated: ProxyImpactPoint[];
  mitigated: ProxyImpactPoint[];
};

type MarginalApplicant = {
  id: string;
  race: string;
  sex: string;
  education: string;
  occupation: string;
  marital_status: string;
  model_b_decision: string;
  model_c_decision: string;
  shap_delta_explanation: string;
};

type ImpossibilityResponse = {
  fairness_focus: "parity" | "opportunity";
  metrics: {
    demographic_parity: number;
    equal_opportunity: number;
    predictive_parity: number;
  };
};

type InteractiveMitigationStudioProps = {
  isGlobalForcedFallback?: boolean;
};

const FALLBACK_TRADEOFF: TradeoffResponse = {
  mitigation_weight: 0.5,
  accuracy: 0.86,
  demographic_parity: 0.80,
};

const FALLBACK_PROXY_SQUASH: ProxySquashResponse = {
  unmitigated: [
    { name: "Marital_Status", value: 0.32 },
    { name: "Occupation", value: 0.24 },
    { name: "Relationship", value: 0.22 },
    { name: "Education_Num", value: 0.19 },
    { name: "Capital_Gain", value: 0.16 },
  ],
  mitigated: [
    { name: "Marital_Status", value: 0.18 },
    { name: "Occupation", value: 0.18 },
    { name: "Relationship", value: 0.16 },
    { name: "Education_Num", value: 0.17 },
    { name: "Capital_Gain", value: 0.15 },
  ],
};

const FALLBACK_APPLICANTS: MarginalApplicant[] = [
  {
    id: "A-104",
    race: "Black",
    sex: "Female",
    education: "Bachelors",
    occupation: "Sales",
    marital_status: "Divorced",
    model_b_decision: "Rejected",
    model_c_decision: "Approved",
    shap_delta_explanation:
      "Model C down-weighted marital-status proxy penalty and elevated education + hours features, shifting score above threshold.",
  },
  {
    id: "A-127",
    race: "Black",
    sex: "Male",
    education: "Some-college",
    occupation: "Transport-moving",
    marital_status: "Never-married",
    model_b_decision: "Rejected",
    model_c_decision: "Approved",
    shap_delta_explanation:
      "Proxy influence from relationship class was reduced; stable labor features dominated under mitigation.",
  },
  {
    id: "A-133",
    race: "White",
    sex: "Female",
    education: "Masters",
    occupation: "Adm-clerical",
    marital_status: "Separated",
    model_b_decision: "Rejected",
    model_c_decision: "Approved",
    shap_delta_explanation:
      "Mitigated model reduced adverse correlation with marital proxy and increased contribution from education and tenure variables.",
  },
  {
    id: "A-141",
    race: "Asian-Pac-Islander",
    sex: "Female",
    education: "Assoc-voc",
    occupation: "Tech-support",
    marital_status: "Never-married",
    model_b_decision: "Rejected",
    model_c_decision: "Approved",
    shap_delta_explanation:
      "Proxy-shrink lowered relationship penalty; occupation and hours-per-week became primary positive drivers.",
  },
  {
    id: "A-152",
    race: "Black",
    sex: "Female",
    education: "HS-grad",
    occupation: "Other-service",
    marital_status: "Widowed",
    model_b_decision: "Rejected",
    model_c_decision: "Approved",
    shap_delta_explanation:
      "Intersectional reweighting increased representation of similar profiles, reducing systematic underprediction bias.",
  },
];

const FALLBACK_IMPOSSIBILITY: ImpossibilityResponse = {
  fairness_focus: "parity",
  metrics: {
    demographic_parity: 0.87,
    equal_opportunity: 0.68,
    predictive_parity: 0.71,
  },
};

const COLORS = {
  crimson: "#B91C1C",
  deepBlue: "#1D4ED8",
  mutedTeal: "#0F766E",
  slate: "#1E293B",
};

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function normalizeProxySeries(value: unknown): ProxyImpactPoint[] | null {
  if (!Array.isArray(value)) return null;
  const valid = value.every(
    (point) => point && typeof point.name === "string" && typeof point.value === "number"
  );
  return valid ? (value as ProxyImpactPoint[]) : null;
}

export default function InteractiveMitigationStudio({
  isGlobalForcedFallback = false,
}: InteractiveMitigationStudioProps) {
  const [mitigationWeight, setMitigationWeight] = useState(0.5);
  const [tradeoff, setTradeoff] = useState<TradeoffResponse>(FALLBACK_TRADEOFF);
  const [tradeoffSeries, setTradeoffSeries] = useState<Array<{ step: number; accuracy: number }>>([
    { step: 0, accuracy: FALLBACK_TRADEOFF.accuracy },
  ]);

  const [isMitigationEnabled, setIsMitigationEnabled] = useState(true);
  const [proxySquashData, setProxySquashData] = useState<ProxySquashResponse>(FALLBACK_PROXY_SQUASH);

  const [applicants, setApplicants] = useState<MarginalApplicant[]>(FALLBACK_APPLICANTS);
  const [expandedApplicantId, setExpandedApplicantId] = useState<string | null>(null);

  const [fairnessFocus, setFairnessFocus] = useState<"parity" | "opportunity">("parity");
  const [impossibilityData, setImpossibilityData] = useState<ImpossibilityResponse>(FALLBACK_IMPOSSIBILITY);
  const [isLiveTradeoff, setIsLiveTradeoff] = useState(false);
  const [isLiveProxySquash, setIsLiveProxySquash] = useState(false);
  const [isLiveApplicants, setIsLiveApplicants] = useState(false);
  const [isLiveImpossibility, setIsLiveImpossibility] = useState(false);
  const [isApiOfflineTradeoff, setIsApiOfflineTradeoff] = useState(false);
  const [isApiOfflineProxySquash, setIsApiOfflineProxySquash] = useState(false);
  const [isApiOfflineApplicants, setIsApiOfflineApplicants] = useState(false);
  const [isApiOfflineImpossibility, setIsApiOfflineImpossibility] = useState(false);

  useEffect(() => {
    if (isGlobalForcedFallback) {
      const forcedFallback = {
        ...FALLBACK_TRADEOFF,
        mitigation_weight: mitigationWeight,
        accuracy: 0.89 - 0.06 * mitigationWeight,
        demographic_parity: 0.55 + 0.31 * mitigationWeight,
      };
      setTradeoff(forcedFallback);
      setIsLiveTradeoff(false);
      setIsApiOfflineTradeoff(false);
      setTradeoffSeries((prev) => [
        ...prev.slice(-9),
        {
          step: prev.length,
          accuracy: forcedFallback.accuracy,
        },
      ]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/tradeoff?mitigation_weight=${mitigationWeight.toFixed(2)}&t=${Date.now()}`
        );
        if (!response.ok) throw new Error("tradeoff endpoint failed");
        const payload = (await response.json()) as TradeoffResponse;

        if (
          typeof payload.accuracy !== "number" ||
          typeof payload.demographic_parity !== "number"
        ) {
          throw new Error("tradeoff payload malformed");
        }

        setTradeoff(payload);
        setIsLiveTradeoff(true);
        setIsApiOfflineTradeoff(false);
        setTradeoffSeries((prev) => [
          ...prev.slice(-9),
          {
            step: prev.length,
            accuracy: payload.accuracy,
          },
        ]);
      } catch {
        const fallback = {
          ...FALLBACK_TRADEOFF,
          mitigation_weight: mitigationWeight,
          accuracy: 0.89 - 0.06 * mitigationWeight,
          demographic_parity: 0.55 + 0.31 * mitigationWeight,
        };
        setTradeoff(fallback);
        setIsLiveTradeoff(false);
        setIsApiOfflineTradeoff(true);
        setTradeoffSeries((prev) => [
          ...prev.slice(-9),
          {
            step: prev.length,
            accuracy: fallback.accuracy,
          },
        ]);
      }
    }, 120);

    return () => clearTimeout(timeout);
  }, [mitigationWeight, isGlobalForcedFallback]);

  useEffect(() => {
    if (isGlobalForcedFallback) {
      setProxySquashData(FALLBACK_PROXY_SQUASH);
      setIsLiveProxySquash(false);
      setIsApiOfflineProxySquash(false);
      return;
    }

    const loadProxySquash = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/proxy-squash?t=${Date.now()}`);
        if (!response.ok) throw new Error("proxy-squash endpoint failed");
        const payload = (await response.json()) as {
          unmitigated?: ProxyImpactPoint[];
          mitigated?: ProxyImpactPoint[];
        };

        const unmitigated = normalizeProxySeries(payload.unmitigated);
        const mitigated = normalizeProxySeries(payload.mitigated);

        if (!unmitigated || !mitigated) {
          throw new Error("proxy-squash payload malformed");
        }

        setProxySquashData({ unmitigated, mitigated });
        setIsLiveProxySquash(true);
        setIsApiOfflineProxySquash(false);
      } catch {
        setProxySquashData(FALLBACK_PROXY_SQUASH);
        setIsLiveProxySquash(false);
        setIsApiOfflineProxySquash(true);
      }
    };

    void loadProxySquash();
  }, [isGlobalForcedFallback]);

  useEffect(() => {
    if (isGlobalForcedFallback) {
      setApplicants(FALLBACK_APPLICANTS);
      setIsLiveApplicants(false);
      setIsApiOfflineApplicants(false);
      return;
    }

    const loadApplicants = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/marginal-applicants?t=${Date.now()}`);
        if (!response.ok) throw new Error("marginal-applicants endpoint failed");
        const payload = (await response.json()) as { applicants: MarginalApplicant[] };

        if (!Array.isArray(payload.applicants)) {
          throw new Error("marginal-applicants payload malformed");
        }

        setApplicants(payload.applicants);
        setIsLiveApplicants(true);
        setIsApiOfflineApplicants(false);
      } catch {
        setApplicants(FALLBACK_APPLICANTS);
        setIsLiveApplicants(false);
        setIsApiOfflineApplicants(true);
      }
    };

    void loadApplicants();
  }, [isGlobalForcedFallback]);

  useEffect(() => {
    if (isGlobalForcedFallback) {
      setImpossibilityData(
        fairnessFocus === "parity"
          ? {
              fairness_focus: "parity",
              metrics: {
                demographic_parity: 0.87,
                equal_opportunity: 0.68,
                predictive_parity: 0.71,
              },
            }
          : {
              fairness_focus: "opportunity",
              metrics: {
                demographic_parity: 0.69,
                equal_opportunity: 0.86,
                predictive_parity: 0.72,
              },
            }
      );
      setIsLiveImpossibility(false);
      setIsApiOfflineImpossibility(false);
      return;
    }

    const loadImpossibility = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/impossibility-theorem?fairness_focus=${fairnessFocus}&t=${Date.now()}`
        );
        if (!response.ok) throw new Error("impossibility-theorem endpoint failed");
        const payload = (await response.json()) as ImpossibilityResponse;

        if (
          typeof payload?.metrics?.demographic_parity !== "number" ||
          typeof payload?.metrics?.equal_opportunity !== "number" ||
          typeof payload?.metrics?.predictive_parity !== "number"
        ) {
          throw new Error("impossibility-theorem payload malformed");
        }

        setImpossibilityData(payload);
        setIsLiveImpossibility(true);
        setIsApiOfflineImpossibility(false);
      } catch {
        setImpossibilityData(
          fairnessFocus === "parity"
            ? {
                fairness_focus: "parity",
                metrics: {
                  demographic_parity: 0.87,
                  equal_opportunity: 0.68,
                  predictive_parity: 0.71,
                },
              }
            : {
                fairness_focus: "opportunity",
                metrics: {
                  demographic_parity: 0.69,
                  equal_opportunity: 0.86,
                  predictive_parity: 0.72,
                },
              }
        );
        setIsLiveImpossibility(false);
        setIsApiOfflineImpossibility(true);
      }
    };

    void loadImpossibility();
  }, [fairnessFocus, isGlobalForcedFallback]);

  const displayedProxyData = useMemo(
    () => (isMitigationEnabled ? proxySquashData.mitigated : proxySquashData.unmitigated),
    [isMitigationEnabled, proxySquashData]
  );

  const radarData = useMemo(
    () => [
      { metric: "Demographic Parity", value: impossibilityData.metrics.demographic_parity },
      { metric: "Equal Opportunity", value: impossibilityData.metrics.equal_opportunity },
      { metric: "Predictive Parity", value: impossibilityData.metrics.predictive_parity },
    ],
    [impossibilityData]
  );

  const isStudioLive = isLiveTradeoff && isLiveProxySquash && isLiveApplicants && isLiveImpossibility;
  const isAnyApiOffline =
    isApiOfflineTradeoff ||
    isApiOfflineProxySquash ||
    isApiOfflineApplicants ||
    isApiOfflineImpossibility;

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
        <header className="mb-8 border-b border-black pb-5">
          <p className="font-sans text-xs uppercase tracking-[0.18em]">Interactive Mitigation Studio</p>
          <h1 className="mt-2 font-serif text-4xl font-bold leading-tight md:text-5xl">
            Mechanisms, Trade-offs, and Limits
          </h1>
          <p className="mt-3 max-w-3xl font-sans text-sm md:text-base">
            A live operational sandbox to test mitigation pressure, inspect proxy suppression, and visualize fairness impossibility constraints.
          </p>
          <div className="mt-4">
            <DataSourceBadge isLive={isStudioLive} />
          </div>
          {isAnyApiOffline && !isGlobalForcedFallback && (
            <div className="mt-3 border border-red-700 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-800">
              API Offline: Live fetch failed. Showing golden synthetic fallback.
            </div>
          )}
        </header>

        <section className="mb-10 border border-black p-5">
          <h2 className="font-serif text-3xl font-bold">The Mitigation Engine</h2>
          <p className="mt-1 font-sans text-sm">
            Tune mitigation weight, observe accuracy drift, and inspect proxy signal compression in real time.
          </p>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <article className="border border-black p-4">
              <h3 className="font-serif text-2xl font-semibold">Trade-off Slider</h3>
              <p className="mt-1 font-sans text-sm">Mitigation Weight: {mitigationWeight.toFixed(2)}</p>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={mitigationWeight}
                onChange={(e) => setMitigationWeight(Number(e.target.value))}
                className="mt-4 w-full accent-black"
              />

              <div className="mt-4 grid grid-cols-2 gap-4 border border-black p-3">
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.14em]">Accuracy</p>
                  <p className="font-serif text-3xl font-bold">{pct(tradeoff.accuracy)}</p>
                </div>
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.14em]">Demographic Parity</p>
                  <p className="font-serif text-3xl font-bold">{tradeoff.demographic_parity.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-4 h-56 w-full border border-black p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tradeoffSeries} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid stroke="#000" strokeDasharray="2 2" />
                    <XAxis dataKey="step" tickLine={false} axisLine={false} stroke="#000" />
                    <YAxis domain={[0.75, 0.95]} tickLine={false} axisLine={false} stroke="#000" />
                    <Tooltip
                      formatter={(value: number) => value.toFixed(3)}
                      contentStyle={{ border: "1px solid #000", borderRadius: 0, background: "#fff" }}
                    />
                    <Line type="monotone" dataKey="accuracy" stroke={COLORS.deepBlue} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="border border-black p-4">
              <h3 className="font-serif text-2xl font-semibold">Proxy Squash Visualizer</h3>
              <button
                type="button"
                onClick={() => setIsMitigationEnabled((v) => !v)}
                className="mt-3 border border-black px-3 py-1 font-sans text-sm"
              >
                {isMitigationEnabled ? "Apply Sample Re-weighting: ON" : "Apply Sample Re-weighting: OFF"}
              </button>

              <div className="mt-4 h-72 w-full border border-black p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayedProxyData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid stroke="#000" strokeDasharray="2 2" />
                    <XAxis type="number" tickLine={false} axisLine={false} stroke="#000" />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} stroke="#000" width={130} />
                    <Tooltip
                      formatter={(value: number) => value.toFixed(2)}
                      contentStyle={{ border: "1px solid #000", borderRadius: 0, background: "#fff" }}
                    />
                    <Bar
                      dataKey="value"
                      fill={isMitigationEnabled ? COLORS.mutedTeal : COLORS.deepBlue}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>
        </section>

        <section className="mb-10 border border-black p-5">
          <h2 className="font-serif text-3xl font-bold">The Human Impact</h2>
          <p className="mt-1 font-sans text-sm">
            Profiles below were rejected by Model B but approved by Model C after mitigation.
          </p>

          <div className="mt-4 overflow-x-auto border border-black">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-black">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Race</th>
                  <th className="px-3 py-2">Sex</th>
                  <th className="px-3 py-2">Education</th>
                  <th className="px-3 py-2">Occupation</th>
                  <th className="px-3 py-2">Marital Status</th>
                  <th className="px-3 py-2">Model B</th>
                  <th className="px-3 py-2">Model C</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant) => {
                  const expanded = expandedApplicantId === applicant.id;
                  return (
                    <Fragment key={applicant.id}>
                      <tr
                        className="cursor-pointer border-b border-black"
                        onClick={() =>
                          setExpandedApplicantId((prev) =>
                            prev === applicant.id ? null : applicant.id
                          )
                        }
                      >
                        <td className="px-3 py-2 font-semibold">{applicant.id}</td>
                        <td className="px-3 py-2">{applicant.race}</td>
                        <td className="px-3 py-2">{applicant.sex}</td>
                        <td className="px-3 py-2">{applicant.education}</td>
                        <td className="px-3 py-2">{applicant.occupation}</td>
                        <td className="px-3 py-2">{applicant.marital_status}</td>
                        <td className="px-3 py-2">{applicant.model_b_decision}</td>
                        <td className="px-3 py-2 font-semibold">{applicant.model_c_decision}</td>
                      </tr>
                      {expanded && (
                        <tr className="border-b border-black">
                          <td className="px-3 py-3" colSpan={8}>
                            {applicant.shap_delta_explanation}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border border-black p-5">
          <h2 className="font-serif text-3xl font-bold">The Mathematical Reality</h2>
          <p className="mt-1 font-sans text-sm">
            Kleinberg&apos;s Impossibility Theorem: optimizing one fairness objective degrades others.
          </p>

          <div className="mt-4 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="border border-black p-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFairnessFocus("parity")}
                  className={`border border-black px-3 py-1 font-sans text-sm ${
                    fairnessFocus === "parity" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  Optimize for Parity
                </button>
                <button
                  type="button"
                  onClick={() => setFairnessFocus("opportunity")}
                  className={`border border-black px-3 py-1 font-sans text-sm ${
                    fairnessFocus === "opportunity" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  Optimize for Opportunity
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border border-black p-3 text-center font-sans text-xs uppercase tracking-[0.12em]">
                <div>
                  <p>Demographic Parity</p>
                  <p className="mt-1 font-serif text-xl normal-case">
                    {impossibilityData.metrics.demographic_parity.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p>Equal Opportunity</p>
                  <p className="mt-1 font-serif text-xl normal-case">
                    {impossibilityData.metrics.equal_opportunity.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p>Predictive Parity</p>
                  <p className="mt-1 font-serif text-xl normal-case">
                    {impossibilityData.metrics.predictive_parity.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-80 border border-black p-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#000" />
                  <PolarAngleAxis dataKey="metric" stroke="#000" tick={{ fill: "#000", fontSize: 11 }} />
                  <Radar dataKey="value" stroke={COLORS.slate} fill={COLORS.mutedTeal} fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
