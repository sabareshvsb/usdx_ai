"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { TOKEN, formatUsdCompact } from "@/lib/token";
import { useDexScreener } from "@/hooks/useDexScreener";
import { cn } from "@/lib/utils";

export default function ActivityTable() {
  const { data } = useDexScreener();

  const buys = data?.buys24h ?? TOKEN.buys24h;
  const sells = data?.sells24h ?? TOKEN.sells24h;
  const total = data?.txns24h ?? TOKEN.txns24h;
  const volume = data?.volume24h ?? TOKEN.volume24h;

  const rows = [
    { id: "1", side: "sell" as const, label: "Sell transactions", count: sells, share: total > 0 ? ((sells / total) * 100).toFixed(1) + "%" : "0%" },
    { id: "2", side: "buy" as const, label: "Buy transactions", count: buys, share: total > 0 ? ((buys / total) * 100).toFixed(1) + "%" : "0%" },
  ];

  return (
    <div className="rounded-[14px] border border-border-subtle bg-bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
        <h3 className="text-[13px] font-semibold text-text-primary">
          {TOKEN.symbol} · 24H Pool Activity
        </h3>
        <span className="text-[11px] text-text-muted tabular-nums">
          {total.toLocaleString("en-US")} txns · {formatUsdCompact(volume)}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Side</th>
              <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Count</th>
              <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Share</th>
              <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Distribution</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const pct = total > 0 ? (r.count / total) * 100 : 0;
              const isSell = r.side === "sell";
              return (
                <tr
                  key={r.id}
                  className="border-b border-border-subtle/50 transition-colors hover:bg-bg-elevated/30 last:border-b-0"
                >
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                        isSell ? "bg-error/10 text-error" : "bg-success/10 text-success"
                      )}
                    >
                      {isSell ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                      {r.side}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[13px] font-semibold tabular-nums text-text-primary">
                    {r.count.toLocaleString("en-US")}
                  </td>
                  <td className="px-5 py-3 text-[12px] tabular-nums text-text-secondary">
                    {r.share}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-bg-elevated">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            isSell ? "bg-error/70" : "bg-success/70"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-text-muted">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
