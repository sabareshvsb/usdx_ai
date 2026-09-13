import { cn } from "@/lib/utils";

export default function LiveBadge({
  label = "LIVE",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-medium bg-bg-elevated/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-text-secondary",
        className
      )}
    >
      <span className="live-dot relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-error" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-error" />
      </span>
      {label}
    </span>
  );
}