"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicContent } from "@/lib/cms-types";

interface UsePublicContentOptions {
  pollMs?: number;
  /** Called synchronously before fresh data is committed to state. */
  onBeforeUpdate?: (current: PublicContent | null) => void;
}

interface UsePublicContentResult {
  data: PublicContent | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Fetches the public CMS read-model. Pass pollMs > 0 to keep the
 * data fresh (used by live widgets like the leaderboard).
 */
export function usePublicContent({
  pollMs = 0,
  onBeforeUpdate,
}: UsePublicContentOptions = {}): UsePublicContentResult {
  const [data, setDataState] = useState<PublicContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seqRef = useRef(0);
  const dataRef = useRef<PublicContent | null>(null);
  const onBeforeUpdateRef = useRef(onBeforeUpdate);

  useEffect(() => {
    onBeforeUpdateRef.current = onBeforeUpdate;
  }, [onBeforeUpdate]);

  const setData = (next: PublicContent | null) => {
    dataRef.current = next;
    setDataState(next);
  };

  const refresh = useCallback(() => {
    const seq = ++seqRef.current;
    return fetch("/api/public/content", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load content");
        const json: PublicContent = await res.json();
        if (seqRef.current === seq) {
          onBeforeUpdateRef.current?.(dataRef.current);
          setData(json);
          setError(null);
        }
        return json;
      })
      .catch((err: unknown) => {
        if (seqRef.current === seq) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      })
      .finally(() => {
        if (seqRef.current === seq) setLoading(false);
      });
  }, []);

  useEffect(() => {
    const seq = seqRef.current;
    void Promise.resolve().then(refresh);
    let timer: ReturnType<typeof setInterval> | undefined;
    if (pollMs > 0) {
      timer = setInterval(() => {
        if (document.visibilityState === "visible") void refresh();
      }, pollMs);
    }
    return () => {
      seqRef.current = seq + 1;
      if (timer) clearInterval(timer);
    };
  }, [refresh, pollMs]);

  return { data, loading, error, refresh };
}