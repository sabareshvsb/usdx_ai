"use client";

import { TrendingUp } from "lucide-react";
import { TOKEN, formatUsd } from "@/lib/token";
import { useDexScreener } from "@/hooks/useDexScreener";

export default function CompoundingCard() {
  const { data } = useDexScreener();

  const high24h = data?.high24h ?? TOKEN.high24h;
  const low24h = data?.low24h ?? TOKEN.low24h;
  const priceChange24h = data?.priceChange24h ?? TOKEN.priceChange24h;
  const volume24h = data?.volume24h ?? TOKEN.volume24h;

  const days = 30;
  const dailyVolume = volume24h / days;

  const isPositive = priceChange24h >= 0;

  return (
    <div className="group rounded-[14px] border border-border-subtle bg-bg-card p-4 transition-all duration-300 hover:border-border-medium">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-accent-cyan/10">
            <TrendingUp className="h-4 w-4 text-accent-cyan" />
          </div>
          <h3 className="text-[13px] font-semibold text-text-primary">Price Stats</h3>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-text-muted">24H High</p>
          <p className="mt-0.5 text-[15px] font-bold tabular-nums text-text-primary">
            {formatUsd(high24h)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-text-muted">24H Low</p>
          <p className="mt-0.5 text-[15px] font-bold tabular-nums text-text-primary">
            {formatUsd(low24h)}
          </p>
        </div>
      </div>

      <div className="mt-3.5">
        <div className="flex items-center justify-between text-[10px] text-text-muted mb-1.5">
          <span>24H change</span>
          <span className={`tabular-nums font-semibold ${isPositive ? "text-success" : "text-error"}`}>
            {isPositive ? "+" : ""}{priceChange24h.toFixed(2)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-cyan"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-text-muted">Avg 24H vol / {days}d</span>
        <span className="text-[12px] font-semibold tabular-nums text-text-primary">
          {formatUsd(dailyVolume, 0)}
        </span>
      </div>
    </div>
  );
}
