"use client";

import { Activity, ArrowDownLeft, ArrowUpRight, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import {
  shortAddr,
  formatTokenAmount,
  timeAgo,
} from "@/lib/transactions";

export default function TransactionsPanel() {
  const { transactions, loading, error, refresh } = useTransactions(30000);

  const txs = transactions.slice(0, 25);

  return (
    <div className="flex h-full flex-col rounded-[14px] border border-border-subtle bg-bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent-cyan" />
          <h3 className="text-[13px] font-semibold text-text-primary">
            Live Transactions
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-accent-cyan/10 px-2 py-0.5 text-[10px] font-medium text-accent-cyan tabular-nums">
            {txs.length}
          </span>
          <button
            onClick={refresh}
            disabled={loading}
            className="rounded-full p-1 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-secondary disabled:opacity-50"
            title="Refresh transactions"
          >
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && txs.length === 0 ? (
          <div className="flex h-24 items-center justify-center gap-2 text-text-muted">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-[11px]">Fetching on-chain…</span>
          </div>
        ) : error && txs.length === 0 ? (
          <div className="flex h-24 items-center justify-center px-4 text-center text-[11px] text-error">
            Could not load transactions
          </div>
        ) : txs.length === 0 ? (
          <div className="flex h-24 items-center justify-center px-4 text-center text-[11px] text-text-muted">
            No recent transactions from tracked contracts
          </div>
        ) : (
          txs.map((t) => {
            const isIn = t.direction === "in";
            const label = isIn
              ? t.relayed
                ? `${t.contractLabel} · Staked`
                : `${t.contractLabel} · In`
              : t.relayed
                ? `${t.contractLabel} · Withdrawn`
                : `${t.contractLabel} · Out`;
            return (
              <a
                key={`${t.hash}:${t.block}`}
                href={`https://basescan.org/tx/${t.hash}`}
                target="_blank"
                rel="noreferrer"
                className="group flex gap-3 border-b border-border-subtle px-4 py-3 transition-colors hover:bg-bg-elevated/40 last:border-b-0"
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    isIn
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  )}
                >
                  {isIn ? (
                    <ArrowDownLeft className="h-3 w-3" />
                  ) : (
                    <ArrowUpRight className="h-3 w-3" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] font-medium text-text-primary">
                      {label}
                    </p>
                    <span className="flex shrink-0 items-center gap-1 text-[10px] text-text-muted tabular-nums">
                      <ExternalLink className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
                      {timeAgo(t.timestamp)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] tabular-nums text-accent-cyan">
                    {formatTokenAmount(t.value)} {t.tokenSymbol}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[10px] text-text-muted">
                    {shortAddr(t.counterparty)}
                  </p>
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}