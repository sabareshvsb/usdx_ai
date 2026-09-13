"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Globe, ChevronUp, ChevronDown } from "lucide-react";
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
import InstructionEditor from "@/components/admin/InstructionEditor";
import type { CmsInstruction } from "@/lib/cms-types";

export default function InstructionsManager() {
  const toast = useToast();
  const [items, setItems] = useState<CmsInstruction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CmsInstruction | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<CmsInstruction | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api<{ instructions: CmsInstruction[] }>("/api/admin/instructions");
      setItems(res.instructions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load instructions");
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
      await api(`/api/admin/instructions/${id}`, {
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

  const reorder = async (i: number, dir: -1 | 1) => {
    if (!items) return;
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    try {
      await Promise.all([
        api(`/api/admin/instructions/${next[i].id}`, {
          method: "PATCH",
          body: JSON.stringify({ sort_order: i }),
        }),
        api(`/api/admin/instructions/${next[j].id}`, {
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
      await api(`/api/admin/instructions/${deleting.id}`, { method: "DELETE" });
      toast("Instruction deleted", "success");
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
        <p className="text-[13px] text-error">Failed to load instructions: {error}</p>
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
        title="Instructions"
        description="Step-by-step guides shown to users. Order them by dragging the arrows."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New instruction
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState message="No instructions yet. Create your first guide." />
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <Card key={item.id} className="py-3.5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-text-primary">
                      {item.title}
                    </span>
                    {item.status === "published" ? (
                      <Badge tone="blue">published</Badge>
                    ) : (
                      <Badge tone="warning">draft</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12px] text-text-muted">
                    {item.description.length > 120
                      ? `${item.description.slice(0, 120)}…`
                      : item.description || "No description"}
                    {item.item_date && ` · ${item.item_date}`}
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
                        ? mutate(item.id, { status: "draft" }, "Instruction unpublished")
                        : mutate(item.id, { status: "published" }, "Instruction published")
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
                    aria-label="Delete instruction"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {item.image_url ? (
                    <Globe className="h-4 w-4 text-text-muted" />
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <InstructionEditor
          instruction={editing}
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
        title="Delete instruction"
        message={`Delete “${deleting?.title}”? This cannot be undone.`}
        loading={busyId === deleting?.id}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}