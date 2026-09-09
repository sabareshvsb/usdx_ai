"use client";

import { cn } from "@/lib/utils";
import { Bell, ExternalLink, Clock } from "lucide-react";
import { TOKEN, formatUsd } from "@/lib/token";
import { useDexScreener } from "@/hooks/useDexScreener";

interface Update {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor: string;
  timestamp: string;
  priority?: "high" | "medium" | "low";
}

export default function UpdatesPanel() {
  const { data } = useDexScreener();

  const priceChange24h = data?.priceChange24h ?? TOKEN.priceChange24h;
  const volume24h = data?.volume24h ?? TOKEN.volume24h;
  const txns24h = data?.txns24h ?? TOKEN.txns24h;
  const high24h = data?.high24h ?? TOKEN.high24h;
  const low24h = data?.low24h ?? TOKEN.low24h;
  const liquidity = data?.liquidityUsd ?? TOKEN.liquidity;

  const updates: Update[] = [
    {
      id: "1",
      title: `${TOKEN.symbol}/DAI Pool Active`,
      description: `Trading pair live on Uniswap V2 (Base) with ${(liquidity / 1000).toFixed(1)}K liquidity. Pool created ${TOKEN.ageDays} days ago.`,
      category: "Pool",
      categoryColor: "bg-accent-blue/15 text-accent-blue",
      timestamp: "Live",
      priority: "high",
    },
    {
      id: "2",
      title: `24H Price ${priceChange24h >= 0 ? "+" : ""}${priceChange24h.toFixed(1)}%`,
      description: `24H high of ${formatUsd(high24h)} and low of ${formatUsd(low24h)}. Volume of $${(volume24h / 1000).toFixed(1)}K across ${txns24h} transactions.`,
      category: "Market",
      categoryColor: "bg-accent-cyan/15 text-accent-cyan",
      timestamp: "24H",
      priority: "medium",
    },
    {
      id: "3",
      title: `${TOKEN.holders.toLocaleString("en-US")} Holders`,
      description: `Holder base observed across the USDXSMART ecosystem on Base. Strength varies across top holders and retail.`,
      category: "Holders",
      categoryColor: "bg-accent-amber/15 text-accent-amber",
      timestamp: "On-chain",
      priority: "low",
    },
  ];

  return (
    <div className="flex h-full flex-col rounded-[14px] border border-border-subtle bg-bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-accent-blue" />
          <h3 className="text-[13px] font-semibold text-text-primary">Token Insights</h3>
        </div>
        <span className="rounded-full bg-accent-blue/10 px-2 py-0.5 text-[10px] font-medium text-accent-blue">
          {updates.length} insights
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {updates.map((u, i) => (
          <div
            key={u.id}
            className={cn(
              "group flex gap-3 border-b border-border-subtle px-4 py-3 transition-colors hover:bg-bg-elevated/40",
              i === updates.length - 1 && "border-b-0"
            )}
          >
            {u.priority === "high" && (
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-blue" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[12px] font-medium text-text-primary truncate">
                  {u.title}
                </p>
                <ExternalLink className="h-3 w-3 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted line-clamp-2">
                {u.description}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", u.categoryColor)}>
                  {u.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-text-muted">
                  <Clock className="h-2.5 w-2.5" />
                  {u.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
