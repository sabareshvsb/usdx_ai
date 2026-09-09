"use client";

import { useState, useEffect, useCallback } from "react";
import type { DexScreenerData } from "@/lib/dexscreener";
import { TOKEN } from "@/lib/token";

interface UseDexScreenerResult {
  data: DexScreenerData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDexScreener(): UseDexScreenerResult {
  const [data, setData] = useState<DexScreenerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/token");
      if (!res.ok) throw new Error("Failed to fetch token data");

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      // Fallback to static TOKEN data
      setData({
        price: TOKEN.price,
        priceUsd: String(TOKEN.price),
        priceChange24h: TOKEN.priceChange24h,
        priceChange1h: 0,
        volume24h: TOKEN.volume24h,
        volume6h: TOKEN.volume24h / 4,
        volume1h: TOKEN.volume24h / 24,
        buys24h: TOKEN.buys24h,
        sells24h: TOKEN.sells24h,
        txns24h: TOKEN.txns24h,
        liquidityUsd: TOKEN.liquidity,
        liquidityBase: TOKEN.pooledToken,
        liquidityQuote: TOKEN.pooledQuote,
        high24h: TOKEN.high24h,
        low24h: TOKEN.low24h,
        fdv: 0,
        marketCap: 0,
        pairCreatedAt: 0,
        dexUrl: "",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const initial = setTimeout(() => {
      fetchData();
      interval = setInterval(fetchData, 30000);
    }, 0);
    return () => {
      clearTimeout(initial);
      if (interval) clearInterval(interval);
    };
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}
