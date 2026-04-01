type DataSourceBadgeProps = {
  isLive: boolean;
  className?: string;
};

export default function DataSourceBadge({ isLive, className = "" }: DataSourceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 border border-slate-300 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${className}`}
      title={isLive ? "Connected to backend endpoint" : "Using local fallback payload"}
    >
      <span
        className={`h-2 w-2 rounded-full ${isLive ? "bg-[#0F766E]" : "bg-[#B91C1C]"}`}
        aria-hidden="true"
      />
      {isLive ? "Live backend" : "Fallback data"}
    </span>
  );
}
