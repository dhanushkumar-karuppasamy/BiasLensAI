import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const proxyData = [
  { stage: "Model A", directProtectedSignal: 82, proxySignal: 24, fairnessRisk: 88 },
  { stage: "Model B", directProtectedSignal: 14, proxySignal: 76, fairnessRisk: 79 },
  { stage: "Model C", directProtectedSignal: 16, proxySignal: 31, fairnessRisk: 36 },
];

export function ProxySignalShiftChart() {
  return (
    <div className="app-card rounded-2xl p-5 md:p-6">
      <h3 className="text-sm font-semibold text-slate-900 md:text-base">Signal Shift Across Model Evolution</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Proxy signal spikes in Model B and drops after pre-processing mitigation.
      </p>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={proxyData} margin={{ top: 12, right: 10, left: -18, bottom: 6 }}>
            <XAxis dataKey="stage" stroke="rgba(100, 116, 139, 0.85)" tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(100, 116, 139, 0.85)" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "rgba(17, 23, 40, 0.95)",
                border: "1px solid rgba(167, 190, 255, 0.2)",
                borderRadius: "10px",
                fontSize: "12px",
                color: "#e8edff",
              }}
            />
            <Line
              type="monotone"
              dataKey="directProtectedSignal"
              name="Direct Protected Signal"
              stroke="rgba(255, 133, 161, 0.95)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="proxySignal"
              name="Proxy Signal"
              stroke="rgba(255, 204, 102, 0.95)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="fairnessRisk"
              name="Fairness Risk"
              stroke="rgba(92, 234, 255, 0.95)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
