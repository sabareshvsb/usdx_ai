"use client";

import { useState, useEffect, useCallback } from "react";
import type { Candle } from "@/components/dashboard/CandlestickChart";
import { CANDLES } from "@/lib/token";

interface UseCandlesResult {
  candles: Candle[];
  high24h: number | null;
  low24h: number | null;
  loading: boolean;
  error: string | null;
}

export function useCandles(): UseCandlesResult {
  const [candles, setCandles] = useState<Candle[]>(CANDLES.slice(-60));
  const [high24h, setHigh24h] = useState<number | null>(null);
  const [low24h, setLow24h] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandles = useCallback(async () => {
    try {
      const res = await fetch("/api/candles");
      if (!res.ok) throw new Error("Failed to fetch candle data");

      const result = await res.json();
      if (result.candles?.length) {
        setCandles(result.candles);
        if (result.high24h != null) setHigh24h(result.high24h);
        if (result.low24h != null) setLow24h(result.low24h);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const initial = setTimeout(() => {
      fetchCandles();
      interval = setInterval(fetchCandles, 60000);
    }, 0);
    return () => {
      clearTimeout(initial);
      if (interval) clearInterval(interval);
    };
  }, [fetchCandles]);

  return { candles, high24h, low24h, loading, error };
}