"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Globe,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
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
import SectionEditor from "@/components/admin/SectionEditor";
import type { CmsSection } from "@/lib/cms-types";

export default function SectionsManager() {
  const toast = useToast();
  const [sections, setSections] = useState<CmsSection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CmsSection | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<CmsSection | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api<{ sections: CmsSection[] }>("/api/admin/sections");
      setSections(res.sections);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sections");
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

  const mutate = async (
    id: string,
    patch: Record<string, unknown>,
    successMsg: string
  ) => {
    setBusyId(id);
    try {
      await api(`/api/admin/sections/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      toast(successMsg, "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Action failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  const reorder = async (i: number, dir: -1 | 1) => {
    if (!sections) return;
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    const a = next[i];
    const b = next[j];
    setSections(next);
    try {
      await Promise.all([
        api(`/api/admin/sections/${a.id}`, {
          method: "PATCH",
          body: JSON.stringify({ sort_order: i }),
        }),
        api(`/api/admin/sections/${b.id}`, {
          method: "PATCH",
          body: JSON.stringify({ sort_order: j }),
        }),
      ]);
    } catch {
      load();
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await api(`/api/admin/sections/${deleting.id}`, { method: "DELETE" });
      toast("Section deleted", "success");
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
        <p className="text-[13px] text-error">Failed to load sections: {error}</p>
        <Button className="mt-3" onClick={load}>
          Retry
        </Button>
      </Card>
    );
  }
  if (!sections) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Website Sections"
        description="Each section is an independently manageable part of the site. Publish to make it visible to visitors."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New section
          </Button>
        }
      />

      {sections.length === 0 ? (
        <EmptyState message="No sections yet. Create your first section." />
      ) : (
        <div className="space-y-2">
          {sections.map((s, i) => (
            <Card key={s.id} className="py-3.5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold text-text-primary">
                      {s.title}
                    </span>
                    {s.enabled ? (
                      <Badge tone="success">visible</Badge>
                    ) : (
                      <Badge tone="danger">hidden</Badge>
                    )}
                    {s.status === "published" ? (
                      <Badge tone="blue">published</Badge>
                    ) : (
                      <Badge tone="warning">draft</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-text-muted">
                    key: {s.key}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => reorder(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => reorder(i, 1)}
                    disabled={i === sections.length - 1}
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      mutate(s.id, { enabled: !s.enabled }, s.enabled ? "Section hidden" : "Section visible")
                    }
                    loading={busyId === s.id}
                    title={s.enabled ? "Hide from public site" : "Show on public site"}
                  >
                    {s.enabled ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      s.status === "published"
                        ? mutate(s.id, { status: "draft" }, "Section unpublished")
                        : mutate(s.id, { status: "published" }, "Section published")
                    }
                    loading={busyId === s.id}
                  >
                    {s.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditing(s)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setDeleting(s)}
                    aria-label="Delete section"
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
        <SectionEditor
          section={editing}
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
        title="Delete section"
        message={`Delete “${deleting?.title}”? This cannot be undone.`}
        loading={busyId === deleting?.id}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}