import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

type HealthTrendSparklineProps = {
  data: Array<{ idx: number; score: number }>;
};

export function HealthTrendSparkline({ data }: HealthTrendSparklineProps) {
  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="healthScoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(96, 227, 255, 0.82)" />
              <stop offset="95%" stopColor="rgba(96, 227, 255, 0)" />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={false}
            contentStyle={{
              background: "rgba(17, 23, 40, 0.95)",
              border: "1px solid rgba(167, 190, 255, 0.2)",
              borderRadius: "10px",
              fontSize: "12px",
              color: "#e8edff",
            }}
            formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
            labelFormatter={() => "Validation Snapshot"}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="rgba(96, 227, 255, 0.9)"
            strokeWidth={2}
            fill="url(#healthScoreGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
