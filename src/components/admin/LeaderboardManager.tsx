"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Globe, ChevronUp, ChevronDown, Crown } from "lucide-react";
import { api } from "@/lib/api-client";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Spinner,
  useToast,
} from "@/components/admin/ui";
import LeaderboardEditor from "@/components/admin/LeaderboardEditor";
import type { CmsLeaderboardEntry } from "@/lib/cms-types";
import { formatUsd } from "@/lib/token";
import { cn } from "@/lib/utils";

export default function LeaderboardManager() {
  const toast = useToast();
  const [items, setItems] = useState<CmsLeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CmsLeaderboardEntry | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<CmsLeaderboardEntry | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api<{ leaderboard: CmsLeaderboardEntry[] }>("/api/admin/leaderboard");
      setItems(res.leaderboard);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leaderboard");
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      await load();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mutate = async (id: string, patch: Record<string, unknown>, msg: string) => {
    setBusyId(id);
    try {
      await api(`/api/admin/leaderboard/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      toast(msg, "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Action failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  const moveRank = async (i: number, dir: -1 | 1) => {
    if (!items) return;
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const a = items[i];
    const b = items[j];
    try {
      await Promise.all([
        api(`/api/admin/leaderboard/${a.id}`, {
          method: "PATCH",
          body: JSON.stringify({ rank: b.rank }),
        }),
        api(`/api/admin/leaderboard/${b.id}`, {
          method: "PATCH",
          body: JSON.stringify({ rank: a.rank }),
        }),
      ]);
      toast("Position updated", "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Reorder failed", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await api(`/api/admin/leaderboard/${deleting.id}`, { method: "DELETE" });
      toast("Participant removed", "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setBusyId(null);
      setDeleting(null);
    }
  };

  if (error) {
    return (
      <Card>
        <p className="text-[13px] text-error">Failed to load leaderboard: {error}</p>
        <Button className="mt-3" onClick={load}>
          Retry
        </Button>
      </Card>
    );
  }
  if (!items) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Live Leaderboard"
        description="Rankings shown live on the public site. Publish entries to make them visible."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Add participant
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState message="No participants yet. Add your first participant to start the leaderboard." />
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => {
            const first = i === 0;
            return (
              <Card
                key={item.id}
                className={cn("py-3.5", first && "lb-first border-accent-amber/40")}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold",
                        first
                          ? "bg-gradient-to-br from-accent-amber to-warning text-white"
                          : "bg-bg-elevated text-text-secondary"
                      )}
                    >
                      {first ? <Crown className="h-4 w-4" /> : item.rank}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[14px] font-semibold text-text-primary">
                          {item.name}
                        </span>
                        {item.status === "published" ? (
                          <Badge tone="blue">published</Badge>
                        ) : (
                          <Badge tone="warning">draft</Badge>
                        )}
                        {!item.enabled && <Badge tone="default">hidden</Badge>}
                      </div>
                      <p className="text-[12px] font-semibold tabular-nums text-text-secondary">
                        {formatUsd(Number(item.business_volume))} vol
                        <span
                          className={cn(
                            "ml-2",
                            Number(item.change_24h) >= 0
                              ? "text-success"
                              : "text-error"
                          )}
                        >
                          {Number(item.change_24h) >= 0 ? "+" : ""}
                          {Number(item.change_24h).toFixed(1)}% (24h)
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveRank(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveRank(i, 1)}
                      disabled={i === items.length - 1}
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        item.status === "published"
                          ? mutate(item.id, { status: "draft" }, "Participant unpublished")
                          : mutate(item.id, { status: "published" }, "Participant published")
                      }
                      loading={busyId === item.id}
                    >
                      {item.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => mutate(item.id, { enabled: !item.enabled }, item.enabled ? "Hidden from public site" : "Visible on public site")}
                      disabled={busyId === item.id}
                    >
                      {item.enabled ? "Hide" : "Show"}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditing(item)}>
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleting(item)}
                      aria-label="Delete participant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {item.avatar_url && <Globe className="h-4 w-4 text-text-muted" />}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {(editing || creating) && (
        <LeaderboardEditor
          entry={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            load();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Remove participant"
        message={`Remove “${deleting?.name}” from the leaderboard? Ranks below it will close up.`}
        loading={busyId === deleting?.id}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}