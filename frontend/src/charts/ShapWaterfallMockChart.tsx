import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ShapDatum = {
  feature: string;
  impact: number;
};

type ShapWaterfallMockChartProps = {
  data: ShapDatum[];
};

export function ShapWaterfallMockChart({ data }: ShapWaterfallMockChartProps) {
  return (
    <div className="app-card rounded-2xl p-5 md:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900 md:text-lg">SHAP Waterfall (Model B Proxy Pathways)</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Positive bars increase predicted income likelihood; negative bars drag prediction downward.
        </p>
      </div>

      <div className="h-[330px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 20, left: 20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
            <XAxis type="number" stroke="rgba(100, 116, 139, 0.85)" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="feature"
              width={140}
              stroke="rgba(71, 85, 105, 0.9)"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number) => [`${value > 0 ? "+" : ""}${value.toFixed(2)}`, "SHAP impact"]}
              contentStyle={{
                background: "rgba(17, 23, 40, 0.95)",
                border: "1px solid rgba(167, 190, 255, 0.2)",
                borderRadius: "10px",
                fontSize: "12px",
                color: "#e8edff",
              }}
            />
            <Bar dataKey="impact" radius={[6, 6, 6, 6]}>
              {data.map((entry) => (
                <Cell
                  key={entry.feature}
                  fill={entry.impact >= 0 ? "rgba(94, 234, 212, 0.9)" : "rgba(251, 146, 60, 0.9)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
