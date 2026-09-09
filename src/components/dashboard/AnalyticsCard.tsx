"use client";

import { BarChart3 } from "lucide-react";
import { TOKEN, formatUsdCompact } from "@/lib/token";
import { useDexScreener } from "@/hooks/useDexScreener";

export default function AnalyticsCard() {
  const { data } = useDexScreener();

  const volume24h = data?.volume24h ?? TOKEN.volume24h;
  const txns24h = data?.txns24h ?? TOKEN.txns24h;
  const buys24h = data?.buys24h ?? TOKEN.buys24h;
  const sells24h = data?.sells24h ?? TOKEN.sells24h;

  const metrics = [
    { label: "24H Vol", value: formatUsdCompact(volume24h), sub: `${txns24h} txns` },
    { label: "Buys", value: String(buys24h), sub: "24H" },
    { label: "Sells", value: String(sells24h), sub: "24H" },
    { label: "Security", value: String(TOKEN.securityScore), sub: "/100" },
  ];

  return (
    <div className="group rounded-[14px] border border-border-subtle bg-bg-card p-4 transition-all duration-300 hover:border-border-medium">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-bg-elevated">
            <BarChart3 className="h-4 w-4 text-text-secondary" />
          </div>
          <h3 className="text-[13px] font-semibold text-text-primary">Pool Analytics</h3>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-[8px] bg-bg-elevated/60 px-2.5 py-2">
            <p className="text-[10px] text-text-muted">{m.label}</p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-[16px] font-bold tabular-nums text-text-primary">{m.value}</span>
              <span className="text-[10px] font-medium text-text-muted">{m.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-[8px] border border-accent-amber/20 bg-accent-amber/5 px-2.5 py-2">
        <p className="text-[10px] text-text-muted">GT Security Score</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-elevated">
            <div
              className={`h-full rounded-full ${TOKEN.securityScore < 50 ? "bg-error" : "bg-success"}`}
              style={{ width: `${TOKEN.securityScore}%` }}
            />
          </div>
          <span className={`text-[12px] font-bold tabular-nums ${TOKEN.securityScore < 50 ? "text-error" : "text-success"}`}>
            {TOKEN.securityScore.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
