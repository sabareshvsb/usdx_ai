"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import AnnouncementEditor from "@/components/admin/AnnouncementEditor";
import { fmtDate } from "@/lib/api-client";
import type { CmsAnnouncement } from "@/lib/cms-types";

export default function AnnouncementsManager() {
  const toast = useToast();
  const [items, setItems] = useState<CmsAnnouncement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CmsAnnouncement | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<CmsAnnouncement | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api<{ announcements: CmsAnnouncement[] }>("/api/admin/announcements");
      setItems(res.announcements);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load announcements");
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
      await api(`/api/admin/announcements/${id}`, {
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

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await api(`/api/admin/announcements/${deleting.id}`, { method: "DELETE" });
      toast("Announcement deleted", "success");
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
        <p className="text-[13px] text-error">Failed to load announcements: {error}</p>
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
        title="Announcements"
        description="Short messages shown to users. Publish to make one visible."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New announcement
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState message="No announcements yet. Publish one to inform your users." />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="py-3.5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold text-text-primary">
                      {item.title}
                    </span>
                    {item.link_url && <Badge tone="blue">linked</Badge>}
                    {item.status === "published" ? (
                      <Badge tone="success">live</Badge>
                    ) : (
                      <Badge tone="warning">draft</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-text-muted">
                    {item.message}
                  </p>
                  <p className="mt-0.5 text-[11px] text-text-muted">
                    Updated {fmtDate(item.updated_at)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      item.status === "published"
                        ? mutate(item.id, { status: "draft" }, "Announcement unpublished")
                        : mutate(item.id, { status: "published" }, "Announcement published")
                    }
                    loading={busyId === item.id}
                  >
                    {item.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditing(item)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setDeleting(item)}
                    aria-label="Delete announcement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <AnnouncementEditor
          announcement={editing}
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
        title="Delete announcement"
        message={`Delete “${deleting?.title}”? This cannot be undone.`}
        loading={busyId === deleting?.id}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}