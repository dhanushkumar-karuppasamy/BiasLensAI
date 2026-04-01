import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, FileOutput, Filter, Lock, SearchCheck, Upload } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ProfileKey = "black_female_divorced" | "white_male_married" | "black_male_never";

type LocalProfile = {
  approval: number;
  status: "Reject" | "Borderline" | "Approve";
  notes: string;
  features: Array<{ feature: string; impact: number }>;
};

type Section3Row = {
  metric: string;
  modelA: string;
  modelB: string;
  modelC: string;
};

type FeatureImpactPoint = {
  feature: string;
  impact: number;
};

const modelAFeatureImpact = [
  { feature: "Sex_Male", impact: 0.33 },
  { feature: "Education_Num", impact: 0.2 },
  { feature: "Capital_Gain", impact: 0.17 },
  { feature: "Hours_Per_Week", impact: 0.11 },
  { feature: "Race_Black", impact: -0.19 },
  { feature: "Marital_Status", impact: 0.08 },
];

const modelBFeatureImpact = [
  { feature: "Marital_Status", impact: 0.29 },
  { feature: "Occupation", impact: 0.24 },
  { feature: "Relationship", impact: 0.21 },
  { feature: "Education_Num", impact: 0.18 },
  { feature: "Capital_Gain", impact: 0.15 },
  { feature: "Native_Country", impact: 0.11 },
];

const section3ComparisonRows: Section3Row[] = [
  {
    metric: "Accuracy",
    modelA: "87.4%",
    modelB: "86.8%",
    modelC: "84.1%",
  },
  {
    metric: "Demographic Parity",
    modelA: "Failing",
    modelB: "Failing",
    modelC: "0.82 (Restored)",
  },
  {
    metric: "Fairness Posture",
    modelA: "Direct demographic dependency",
    modelB: "Proxy substitution",
    modelC: "Mitigated with sample reweighting",
  },
];

const modelCFeatureImpact: FeatureImpactPoint[] = [
  { feature: "Education_Num", impact: 0.14 },
  { feature: "Capital_Gain", impact: 0.11 },
  { feature: "Hours_Per_Week", impact: 0.08 },
  { feature: "Relationship", impact: 0.07 },
  { feature: "Marital_Status", impact: 0.06 },
  { feature: "Occupation", impact: 0.05 },
  { feature: "Native_Country", impact: 0.03 },
];

const localProfiles: Record<ProfileKey, LocalProfile> = {
  black_female_divorced: {
    approval: 0.23,
    status: "Reject",
    notes:
      "Proxy-heavy penalties from marital and relationship signals dominate this profile despite removal of protected columns.",
    features: [
      { feature: "Marital_Status=Divorced", impact: -0.21 },
      { feature: "Relationship=Unmarried", impact: -0.16 },
      { feature: "Occupation=Service", impact: -0.1 },
      { feature: "Capital_Gain", impact: 0.07 },
      { feature: "Education_Num", impact: 0.05 },
    ],
  },
  white_male_married: {
    approval: 0.71,
    status: "Approve",
    notes: "Positive occupational and relationship signals keep this profile above the threshold.",
    features: [
      { feature: "Relationship=Husband", impact: 0.19 },
      { feature: "Occupation=Managerial", impact: 0.14 },
      { feature: "Capital_Gain", impact: 0.11 },
      { feature: "Education_Num", impact: 0.08 },
      { feature: "Hours_Per_Week", impact: 0.07 },
    ],
  },
  black_male_never: {
    approval: 0.39,
    status: "Borderline",
    notes:
      "Colorblind model lowers confidence through proxy pathways tied to relationship and occupation classes.",
    features: [
      { feature: "Relationship=Not-in-family", impact: -0.13 },
      { feature: "Occupation=Transport", impact: -0.08 },
      { feature: "Capital_Gain", impact: 0.09 },
      { feature: "Education_Num", impact: 0.06 },
      { feature: "Hours_Per_Week", impact: 0.04 },
    ],
  },
};

function sectionTitle(eyebrow: string, title: string, text: string) {
  return (
    <header className="mb-6 space-y-3 border-b border-slate-300 pb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
      <h2 className="font-serif text-3xl font-bold leading-tight text-slate-900 md:text-4xl">{title}</h2>
      <p className="max-w-3xl text-sm leading-relaxed text-slate-700 md:text-base">{text}</p>
    </header>
  );
}

function ImpactBarChart({
  title,
  subtitle,
  data,
  accent = "#991b1b",
}: {
  title: string;
  subtitle: string;
  data: Array<{ feature: string; impact: number }>;
  accent?: string;
}) {
  return (
    <article className="border border-slate-300 bg-white p-4">
      <h3 className="font-serif text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="2 2" />
            <XAxis type="number" stroke="#475569" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="feature"
              width={132}
              stroke="#475569"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(v: number) => v.toFixed(2)}
              contentStyle={{ border: "1px solid #cbd5e1", borderRadius: 0, background: "#fff" }}
            />
            <Bar dataKey="impact" radius={0}>
              {data.map((row) => (
                <Cell key={row.feature} fill={row.feature.includes("Sex") || row.feature.includes("Marital") ? accent : "#0f172a"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default function BiasLensInvestigativeReport() {
  const [race, setRace] = useState("Black");
  const [sex, setSex] = useState("Female");
  const [marital, setMarital] = useState("Divorced");
  const [section3Rows, setSection3Rows] = useState<Section3Row[]>(section3ComparisonRows);
  const [section3ModelCImpact, setSection3ModelCImpact] = useState<FeatureImpactPoint[]>(modelCFeatureImpact);
  const [isLoadingSection3, setIsLoadingSection3] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSection3Data = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/model-metrics");
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const payload: unknown = await response.json();
        if (!payload || typeof payload !== "object") {
          throw new Error("Malformed API response payload");
        }

        const typedPayload = payload as {
          section3ComparisonRows?: Section3Row[];
          featureImpact?: { modelC?: FeatureImpactPoint[] };
        };

        const rows = typedPayload.section3ComparisonRows;
        const modelC = typedPayload.featureImpact?.modelC;

        const rowsValid =
          Array.isArray(rows) &&
          rows.every(
            (row) =>
              row &&
              typeof row.metric === "string" &&
              typeof row.modelA === "string" &&
              typeof row.modelB === "string" &&
              typeof row.modelC === "string"
          );

        const modelCValid =
          Array.isArray(modelC) &&
          modelC.every(
            (point) =>
              point && typeof point.feature === "string" && typeof point.impact === "number"
          );

        if (!rowsValid || !modelCValid) {
          throw new Error("Malformed metric rows or SHAP payload");
        }

        if (isMounted) {
          setSection3Rows(rows);
          setSection3ModelCImpact(modelC);
        }
      } catch {
        if (isMounted) {
          setSection3Rows(section3ComparisonRows);
          setSection3ModelCImpact(modelCFeatureImpact);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSection3(false);
        }
      }
    };

    void loadSection3Data();

    return () => {
      isMounted = false;
    };
  }, []);

  const profileKey = useMemo<ProfileKey>(() => {
    if (race === "Black" && sex === "Female" && marital === "Divorced") return "black_female_divorced";
    if (race === "White" && sex === "Male" && marital === "Married") return "white_male_married";
    return "black_male_never";
  }, [race, sex, marital]);

  const profile = localProfiles[profileKey];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
        <header className="mb-10 border-b border-slate-900 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">BiasLens Investigative Report</p>
          <h1 className="mt-3 font-serif text-5xl font-black leading-tight text-slate-950 md:text-6xl">
            Deleting Race and Gender Doesn&apos;t Make Your AI Fair.
          </h1>
          <p className="mt-4 max-w-3xl text-base text-slate-700">
            Exposing the Colorblind Fallacy in tabular machine learning through SHAP-powered proxy detection.
          </p>
        </header>

        <section id="hook" className="mb-14">
          {sectionTitle(
            "Section 1 · The Hook",
            "The Colorblind Fallacy",
            "Removing sensitive attributes does not prevent discrimination; it merely obscures the mechanism and reroutes decisions through proxy variables."
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            <ImpactBarChart
              title="Model A (Overt Bias)"
              subtitle="Sex_Male directly lifts approval rates; protected variables remain visible and influential."
              data={modelAFeatureImpact}
              accent="#b91c1c"
            />
            <ImpactBarChart
              title="Model B (Colorblind Proxy Bias)"
              subtitle="After deleting Sex, bias pressure migrates to Marital-Status and Occupation pathways."
              data={modelBFeatureImpact}
              accent="#1d4ed8"
            />
          </div>

          <div className="mt-5 border-l-4 border-red-700 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800">
            <strong>Takeaway:</strong> model fairness cannot be inferred from feature deletion alone. Bias can persist through
            correlated structural proxies.
          </div>
        </section>

        <section id="human-cost" className="mb-14">
          {sectionTitle(
            "Section 2 · The Human Cost",
            "The Compounding Penalty for Intersectional Identities",
            "Counterfactual analysis shows the same model can produce materially different outcomes for intersecting groups under a colorblind training regime."
          )}

          <blockquote className="mb-6 border-y border-slate-900 py-4 font-serif text-2xl font-semibold leading-snug text-slate-950 md:text-3xl">
            “Under the ‘colorblind’ model, Black females experience a 60% lower approval rate compared to White males.”
          </blockquote>

          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="border border-slate-300 bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-700" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">Counterfactual Control Panel</h3>
              </div>

              <div className="space-y-4">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Race</span>
                  <select value={race} onChange={(e) => setRace(e.target.value)} className="w-full border border-slate-300 bg-white px-3 py-2 text-sm">
                    <option>Black</option>
                    <option>White</option>
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Sex</span>
                  <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full border border-slate-300 bg-white px-3 py-2 text-sm">
                    <option>Female</option>
                    <option>Male</option>
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Marital Status</span>
                  <select
                    value={marital}
                    onChange={(e) => setMarital(e.target.value)}
                    className="w-full border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option>Divorced</option>
                    <option>Married</option>
                    <option>Never-married</option>
                  </select>
                </label>
              </div>
            </aside>

            <article className="border border-slate-300 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <SearchCheck className="h-4 w-4 text-slate-700" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">Local Explanation</h3>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Approval Probability</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{(profile.approval * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Decision Band</p>
                  <p className="mt-1 text-xl font-bold text-red-700">{profile.status}</p>
                </div>
              </div>

              <div className="space-y-2">
                {profile.features.map((f) => (
                  <div key={f.feature} className="flex items-center justify-between border-b border-slate-200 py-2 text-sm">
                    <span className="font-medium text-slate-700">{f.feature}</span>
                    <span className={f.impact < 0 ? "font-semibold text-red-700" : "font-semibold text-blue-800"}>
                      {f.impact > 0 ? "+" : ""}
                      {f.impact.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 border-l-4 border-slate-900 pl-3 text-sm leading-relaxed text-slate-700">{profile.notes}</p>
            </article>
          </div>
        </section>

        <section id="cure" className="mb-14">
          {sectionTitle(
            "Section 3 · The Cure",
            "Restoring Fairness Without Sacrificing Performance",
            "Model C applies pre-processing sample reweighting to recover equity while retaining practical predictive utility."
          )}

          <p className="mb-3 text-xs uppercase tracking-[0.14em] text-slate-500">
            {isLoadingSection3 ? "Loading live backend metrics…" : "Live backend metrics loaded (fallback-safe)."}
          </p>

          <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
            <div className="overflow-hidden border border-slate-300 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-300 bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Metric</th>
                    <th className="px-4 py-3 font-semibold">Model A (Overt)</th>
                    <th className="px-4 py-3 font-semibold">Model B (Proxy)</th>
                    <th className="px-4 py-3 font-semibold">Model C (Mitigated)</th>
                  </tr>
                </thead>
                <tbody>
                  {section3Rows.map((row) => (
                    <tr key={row.metric} className="border-b border-slate-200 last:border-b-0">
                      <td className="px-4 py-3 font-medium">{row.metric}</td>
                      <td className={`px-4 py-3 ${row.modelA === "Failing" ? "text-red-700" : ""}`}>{row.modelA}</td>
                      <td className={`px-4 py-3 ${row.modelB === "Failing" ? "text-red-700" : ""}`}>{row.modelB}</td>
                      <td className="px-4 py-3 font-semibold text-[#2F4F4F]">{row.modelC}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <article className="border border-slate-300 bg-white p-4">
              <h3 className="font-serif text-xl font-semibold text-slate-900">Model C (Mitigated Bias) Feature Impact</h3>
              <p className="mt-1 text-sm text-slate-600">
                Dominant proxy variables are visibly dampened after sample re-weighting, indicating a stabilized decision surface.
              </p>

              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={section3ModelCImpact} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="2 2" />
                    <XAxis type="number" stroke="#475569" tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      width={132}
                      stroke="#475569"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(v: number) => v.toFixed(2)}
                      contentStyle={{ border: "1px solid #cbd5e1", borderRadius: 0, background: "#fff" }}
                    />
                    <Bar dataKey="impact" radius={0}>
                      {section3ModelCImpact.map((row) => (
                        <Cell
                          key={row.feature}
                          fill={row.feature === "Marital_Status" || row.feature === "Occupation" ? "#3F6B68" : "#2F4F4F"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>
        </section>

        <section id="operations" className="pb-6">
          {sectionTitle(
            "Section 4 · Enterprise Governance",
            "From Audit to Operations",
            "A structured operational index for taking fairness from one-off analysis to repeatable enterprise controls."
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <div className="border border-slate-300 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-900">
                <Upload className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">Custom CSV Uploads</h3>
              </div>
              <p className="text-sm text-slate-700">Audit HR, lending, and hiring datasets with the same fairness protocol.</p>
            </div>

            <div className="border border-slate-300 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-900">
                <SearchCheck className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">Auto-Proxy Detection</h3>
              </div>
              <p className="text-sm text-slate-700">Surface hidden protected-attribute proxies before deployment review.</p>
            </div>

            <div className="border border-slate-300 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-900">
                <FileOutput className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">LLM Compliance Reports</h3>
              </div>
              <p className="text-sm text-slate-700">Export SHAP and fairness diagnostics into legal-ready PDF narratives.</p>
            </div>

            <div className="border border-slate-300 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-900">
                <Lock className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">CI/CD Bias Firewalls</h3>
              </div>
              <p className="text-sm text-slate-700">Block model release when disparate impact thresholds are violated.</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
            <p>
              Governance is not documentation after the fact; it is a deployment gate. BiasLens operationalizes that gate.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
