"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Crown,
  Minus,
  RefreshCw,
  Users,
} from "lucide-react";
import CountUp from "@/components/motion/CountUp";
import LiveBadge from "@/components/motion/LiveBadge";
import Reveal from "@/components/motion/Reveal";
import { usePublicContent } from "@/hooks/usePublicContent";
import type { CmsLeaderboardEntry } from "@/lib/cms-types";
import { formatUsd } from "@/lib/token";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "same";

const POLL_MS = 15000;

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="skeleton h-6 w-6 rounded-md" />
      <span className="skeleton h-4 w-6 rounded-full" />
      <span className="skeleton h-4 flex-1 rounded" />
      <span className="skeleton h-5 w-16 rounded" />
    </div>
  );
}

export default function LiveLeaderboard() {
  const [dirs, setDirs] = useState<Record<string, Direction>>({});
  const listRef = useRef<HTMLOListElement>(null);
  const firstPosRef = useRef<Map<string, number> | null>(null);
  const prevRankRef = useRef<Record<string, number>>({});
  const snapshotKeyRef = useRef("");

  const snapshotKey = (rows: CmsLeaderboardEntry[]) =>
    rows.map((e) => `${e.id}:${e.rank}:${e.business_volume}`).join("|");

  const { data, loading, error, refresh } = usePublicContent({
    pollMs: POLL_MS,
    onBeforeUpdate: () => {
      const map = new Map<string, number>();
      for (const child of listRef.current?.children ?? []) {
        const el = child as HTMLElement;
        if (el.dataset.id) map.set(el.dataset.id, el.getBoundingClientRect().top);
      }
      firstPosRef.current = map.size > 0 ? map : null;
    },
  });

  const entries = data?.leaderboard?.length ? [...data.leaderboard] : [];
  const sorted = entries.sort((a, b) => a.rank - b.rank);

  // FLIP animation: translate each row to its previous spot, then smooth to final.
  const applyFlip = useCallback(() => {
    const list = listRef.current;
    const first = firstPosRef.current;
    if (!list || !first || first.size === 0) {
      firstPosRef.current = null;
      return;
    }
    const children = Array.from(list.children) as HTMLElement[];
    children.forEach((child) => {
      const from = first.get(child.dataset.id ?? "");
      if (typeof from === "number") {
        child.style.transform = `translateY(${from - child.getBoundingClientRect().top}px)`;
      }
    });
    void list.offsetWidth; // force reflow before animating to final layout
    children.forEach((child) => {
      child.classList.add("lb-move");
      child.style.transform = "";
    });
    const t = window.setTimeout(() => {
      children.forEach((child) => child.classList.remove("lb-move"));
    }, 550);
    firstPosRef.current = null;
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (sorted.length === 0) return;
    const key = snapshotKey(sorted);
    const changed = key !== snapshotKeyRef.current;
    snapshotKeyRef.current = key;
    if (changed) applyFlip();

    const nextDirs: Record<string, Direction> = {};
    sorted.forEach((entry, idx) => {
      const prev = prevRankRef.current[entry.id];
      if (changed) {
        nextDirs[entry.id] =
          prev === undefined ? "same" : prev === idx ? "same" : prev > idx ? "up" : "down";
      }
    });
    if (changed) {
      setDirs(nextDirs);
      prevRankRef.current = Object.fromEntries(sorted.map((e, i) => [e.id, i]));
    }
  }, [data?.leaderboard, applyFlip]); // eslint-disable-line react-hooks/exhaustive-deps

  const lastUpdated = sorted[0]?.updated_at ?? null;

  return (
    <section id="leaders" className="scroll-mt-16">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <LiveBadge />
              <h2 className="text-[17px] font-bold tracking-tight text-text-primary sm:text-[19px]">
                LIVE LEADERBOARD
              </h2>
            </div>
            <p className="mt-1.5 text-[12px] text-text-muted">
              Business volume rankings — auto-updating in real time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="hidden text-[11px] text-text-muted sm:inline">
                Updated{" "}
                {new Date(lastUpdated).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            )}
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="btn-feel flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-card px-2.5 py-1.5 text-[11px] font-medium text-text-secondary hover:border-border-medium hover:text-text-primary disabled:opacity-60"
              title="Refresh leaderboard"
            >
              <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border-subtle bg-bg-card">
          {/* Column headers */}
          <div className="hidden grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border-subtle bg-bg-elevated/40 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted sm:grid sm:grid-cols-[3rem_minmax(0,1fr)_10rem_7rem]">
            <span>Rank</span>
            <span>Participant</span>
            <span className="hidden text-right sm:block">Business Volume</span>
            <span className="hidden text-right sm:block">24H Change</span>
          </div>

          {loading && sorted.length === 0 ? (
            <div className="divide-y divide-border-subtle">
              {Array.from({ length: 5 }).map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          ) : error && sorted.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <Users className="h-8 w-8 text-text-muted" />
              <p className="text-[13px] font-medium text-text-secondary">
                Could not load the leaderboard
              </p>
              <button
                type="button"
                onClick={refresh}
                className="text-[12px] font-semibold text-accent-blue hover:underline"
              >
                Try again
              </button>
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <Users className="h-8 w-8 text-text-muted" />
              <p className="text-[13px] font-medium text-text-secondary">
                No participants yet
              </p>
              <p className="text-[12px] text-text-muted">
                Entries added in the admin panel appear here instantly.
              </p>
            </div>
          ) : (
            <ol ref={listRef} className="flex flex-col">
              {sorted.map((entry, idx) => {
                const isFirst = idx === 0;
                const dir = dirs[entry.id] ?? "same";
                return (
                  <li
                    key={entry.id}
                    data-id={entry.id}
                    className={cn(
                      "grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border-subtle px-4 py-3 transition-colors last:border-b-0 hover:bg-bg-elevated/40 sm:grid-cols-[3rem_minmax(0,1fr)_10rem_7rem]",
                      isFirst && "lb-first bg-accent-amber/[0.07]"
                    )}
                  >
                    {/* Rank */}
                    <div
                      className={cn(
                        "relative flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold tabular-nums",
                        isFirst
                          ? "bg-gradient-to-br from-accent-amber to-warning text-white shadow-md"
                          : "bg-bg-elevated text-text-secondary"
                      )}
                    >
                      {isFirst ? <Crown className="h-4 w-4" /> : idx + 1}
                      {dir !== "same" && (
                        <span
                          key={entry.updated_at}
                          className={cn(
                            "rank-flash absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px]",
                            dir === "up"
                              ? "bg-success text-white"
                              : "bg-error text-white"
                          )}
                          title={dir === "up" ? "Moved up" : "Moved down"}
                        >
                          {dir === "up" ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Participant */}
                    <div className="flex min-w-0 items-center gap-3">
                      {entry.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={entry.avatar_url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-9 w-9 shrink-0 rounded-full border border-border-subtle object-cover"
                        />
                      ) : (
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                            isFirst
                              ? "bg-gradient-to-br from-accent-amber to-warning text-white"
                              : "bg-bg-elevated text-text-secondary"
                          )}
                        >
                          {entry.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-text-primary">
                          {entry.name}
                        </p>
                        {isFirst && (
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-warning">
                            #1 · Top Participant
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Business volume */}
                    <div className="text-right">
                      <p className="text-[13px] font-bold tabular-nums text-text-primary sm:text-[14px]">
                        <CountUp
                          value={entry.business_volume}
                          decimals={0}
                          format={formatUsd}
                        />
                      </p>
                      <p className="hidden text-[10px] uppercase tracking-wider text-text-muted sm:block">
                        Vol
                      </p>
                    </div>

                    {/* 24H change */}
                    <div className="hidden justify-end sm:flex">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                          entry.change_24h >= 0
                            ? "bg-success/10 text-success"
                            : "bg-error/10 text-error"
                        )}
                      >
                        {entry.change_24h >= 0 ? "+" : ""}
                        {entry.change_24h.toFixed(1)}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </Reveal>

      <Reveal delay={160}>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-text-muted">
          <Minus className="h-3 w-3" />
          Rankings update automatically — manage entries from the Admin Panel.
        </p>
      </Reveal>
    </section>
  );
}