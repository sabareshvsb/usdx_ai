"use client";

import { Wallet, Copy } from "lucide-react";
import { TOKEN, formatUsdCompact, formatUsd } from "@/lib/token";
import { useDexScreener } from "@/hooks/useDexScreener";
import { useState } from "react";
import { cn } from "@/lib/utils";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className={cn(
        "transition-colors",
        copied ? "text-success" : "text-text-muted hover:text-text-secondary"
      )}
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      aria-label="Copy"
    >
      <Copy className="h-3 w-3" />
    </button>
  );
}

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function WalletCard() {
  const { data } = useDexScreener();

  const price = data?.price ?? TOKEN.price;
  const pooledToken = data?.liquidityBase ?? TOKEN.pooledToken;
  const pooledQuote = data?.liquidityQuote ?? TOKEN.pooledQuote;

  return (
    <div className="group rounded-[14px] border border-border-subtle bg-bg-card p-4 transition-all duration-300 hover:border-border-medium">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-accent-amber/10">
            <Wallet className="h-4 w-4 text-accent-amber" />
          </div>
          <h3 className="text-[13px] font-semibold text-text-primary">Token Contract</h3>
        </div>
        <span className="rounded-full bg-bg-elevated px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
          {TOKEN.chain}
        </span>
      </div>

      <div className="mt-3.5">
        <p className="text-[10px] uppercase tracking-wider text-text-muted">Contract</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="truncate font-mono text-[11px] text-text-secondary">
            {TOKEN.contract}
          </span>
          <CopyButton text={TOKEN.contract} />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-wider text-text-muted">Pool (V2 / {TOKEN.quote})</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="truncate font-mono text-[11px] text-text-secondary">
            {shorten(TOKEN.pool)}
          </span>
          <CopyButton text={TOKEN.pool} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <div className="rounded-[8px] bg-bg-elevated/60 px-2.5 py-2">
          <p className="text-[10px] text-text-muted">Pooled</p>
          <p className="mt-0.5 text-[13px] font-bold tabular-nums text-text-primary">
            {pooledToken.toLocaleString("en-US", { maximumFractionDigits: 0 })} {TOKEN.symbol}
          </p>
        </div>
        <div className="rounded-[8px] bg-bg-elevated/60 px-2.5 py-2">
          <p className="text-[10px] text-text-muted">Pooled {TOKEN.quote}</p>
          <p className="mt-0.5 text-[13px] font-bold tabular-nums text-text-primary">
            {formatUsdCompact(pooledQuote)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-text-muted">DEX · {TOKEN.dex}</span>
        <span className="text-[11px] tabular-nums text-success">{formatUsd(price)}</span>
      </div>
    </div>
  );
}
