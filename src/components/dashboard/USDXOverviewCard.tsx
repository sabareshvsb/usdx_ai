"use client";

import Image from "next/image";
import { ArrowUpRight, ArrowDownRight, Coins, ExternalLink, RefreshCw } from "lucide-react";
import CandlestickChart from "@/components/dashboard/CandlestickChart";
import { TOKEN, formatUsd, formatUsdCompact } from "@/lib/token";
import { useDexScreener } from "@/hooks/useDexScreener";
import { useCandles } from "@/hooks/useCandles";

export default function USDXOverviewCard() {
  const { data, loading, refresh } = useDexScreener();
  const { candles, loading: candlesLoading, high24h, low24h } = useCandles();

  const price = data?.price ?? TOKEN.price;
  const priceChange24h = data?.priceChange24h ?? TOKEN.priceChange24h;
  const volume24h = data?.volume24h ?? TOKEN.volume24h;
  const liquidity = data?.liquidityUsd ?? TOKEN.liquidity;
  const txns24h = data?.txns24h ?? TOKEN.txns24h;
  const high = high24h ?? data?.high24h ?? TOKEN.high24h;
  const low = low24h ?? data?.low24h ?? TOKEN.low24h;

  const stats = [
    { label: "24H Volume", value: formatUsdCompact(volume24h) },
    { label: "Liquidity", value: formatUsdCompact(liquidity) },
    { label: "Holders", value: TOKEN.holders.toLocaleString("en-US") },
    { label: "24H Txn", value: txns24h.toLocaleString("en-US") },
  ];

  const isPositive = priceChange24h >= 0;

  return (
    <div className="group rounded-[14px] border border-border-subtle bg-bg-card p-5 transition-all duration-300 hover:border-border-medium">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Image
            src="/usdxcoin.png"
            alt={TOKEN.symbol}
            width={36}
            height={36}
            className="shrink-0 rounded-full"
          />
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-[14px] font-semibold text-text-primary">
              <span className="truncate">{TOKEN.symbol}</span>
              <span className="shrink-0 rounded-full bg-bg-elevated px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-text-muted">
                {TOKEN.chain}
              </span>
            </h3>
            <p className="max-w-[130px] truncate text-[11px] text-text-muted">
              {TOKEN.name}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-secondary disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className={`flex items-center gap-1 rounded-full ${isPositive ? "bg-success/10" : "bg-error/10"} px-2 py-0.5`}>
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3 text-success" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-error" />
            )}
            <span className={`text-[11px] font-medium tabular-nums ${isPositive ? "text-success" : "text-error"}`}>
              {isPositive ? "+" : ""}{priceChange24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[11px] text-text-muted">Price {TOKEN.symbol}/{TOKEN.quote}</p>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-[26px] font-bold tabular-nums tracking-tight text-text-primary">
            {formatUsd(price)}
          </span>
          <span className="text-[12px] text-text-muted tabular-nums">
            {price.toFixed(4)} {TOKEN.quote}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[10px] text-text-muted tabular-nums">
          <span>24H High <span className="text-text-secondary">{formatUsd(high)}</span></span>
          <span>24H Low <span className="text-text-secondary">{formatUsd(low)}</span></span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[10px] bg-bg-elevated/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-text-muted">{s.label}</p>
            <p className="mt-1 text-[15px] font-bold tabular-nums tracking-tight text-text-primary">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[10px] border border-border-subtle bg-bg-elevated/40 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-text-muted">USDXSMART/DAI · 15m</span>
          <span className="flex items-center gap-1 text-[10px] text-text-muted">
            <Coins className="h-3 w-3" />
            Uniswap V2
          </span>
        </div>
        <div className="mt-2 h-36">
          {candlesLoading && candles.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-text-muted" />
            </div>
          ) : (
            <CandlestickChart candles={candles} className="h-full w-full" />
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="truncate font-mono text-[10px] text-text-muted">
          {TOKEN.pool.slice(0, 8)}…{TOKEN.pool.slice(-6)}
        </span>
        <a
          href={`https://basescan.org/token/${TOKEN.contract}`}
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-accent-blue transition-colors hover:underline"
        >
          View
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
