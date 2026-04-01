type DataSourceBadgeProps = {
  isLive?: boolean;
  mode?: "status" | "toggle";
  isGlobalForcedFallback?: boolean;
  onToggleGlobalFallback?: () => void;
  className?: string;
};

export default function DataSourceBadge({
  isLive = false,
  mode = "status",
  isGlobalForcedFallback = false,
  onToggleGlobalFallback,
  className = "",
}: DataSourceBadgeProps) {
  if (mode === "toggle") {
    return (
      <button
        type="button"
        onClick={onToggleGlobalFallback}
        className={`inline-flex items-center border border-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
          isGlobalForcedFallback ? "bg-black text-white" : "bg-white text-black"
        } ${className}`}
        title="Force all pages to use synthetic fallback payloads"
      >
        {isGlobalForcedFallback ? "Mode: Synthetic (Demo)" : "Mode: Live API"}
      </button>
    );
  }

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
