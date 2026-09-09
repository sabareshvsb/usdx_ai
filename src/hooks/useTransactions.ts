"use client";

import { useState, useEffect, useCallback } from "react";
import type { TrackedTransaction } from "@/lib/transactions";

interface UseTransactionsResult {
  transactions: TrackedTransaction[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useTransactions(pollMs = 30000): UseTransactionsResult {
  const [transactions, setTransactions] = useState<TrackedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch transactions");

      const result = await res.json();
      if (result.transactions) {
        setTransactions(result.transactions);
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
      fetchTransactions();
      interval = setInterval(fetchTransactions, pollMs);
    }, 0);
    return () => {
      clearTimeout(initial);
      if (interval) clearInterval(interval);
    };
  }, [fetchTransactions, pollMs]);

  return { transactions, loading, error, refresh: fetchTransactions };
}