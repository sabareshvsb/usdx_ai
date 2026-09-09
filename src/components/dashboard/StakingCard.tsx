"use client";

import { Shield } from "lucide-react";
import { TOKEN } from "@/lib/token";

function HolderBar() {
  const bars = [
    { label: "Top 1", pct: 53.2 },
    { label: "Top 5", pct: 78.4 },
    { label: "Top 10", pct: 91.7 },
    { label: "Others", pct: 8.3 },
  ];
  return (
    <div className="space-y-1.5">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-2">
          <span className="w-12 text-[10px] text-text-muted">{b.label}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-cyan"
              style={{ width: `${b.pct}%` }}
            />
          </div>
          <span className="w-9 text-right text-[10px] tabular-nums text-text-muted">{b.pct}%</span>
        </div>
      ))}
    </div>
  );
}

export default function StakingCard() {
  return (
    <div className="group rounded-[14px] border border-border-subtle bg-bg-card p-4 transition-all duration-300 hover:border-border-medium">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-accent-blue/10">
            <Shield className="h-4 w-4 text-accent-blue" />
          </div>
          <h3 className="text-[13px] font-semibold text-text-primary">Holders</h3>
        </div>
        <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
          {TOKEN.holders.toLocaleString("en-US")}
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Max Supply</p>
          <p className="mt-0.5 text-[16px] font-bold tabular-nums text-text-primary">
            {TOKEN.maxSupply.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Age</p>
          <p className="mt-0.5 text-[16px] font-bold tabular-nums text-text-primary">
            {TOKEN.ageDays} days
          </p>
        </div>
      </div>

      <div className="mt-3.5">
        <HolderBar />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="truncate font-mono text-[10px] text-text-muted">
          Top whale: {TOKEN.topHolder.slice(0, 6)}…{TOKEN.topHolder.slice(-4)}
        </span>
      </div>
    </div>
  );
}
