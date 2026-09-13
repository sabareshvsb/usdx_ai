"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2, Pencil } from "lucide-react";
import { api } from "@/lib/api-client";
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Spinner,
  useToast,
} from "@/components/admin/ui";
import type { CmsSettingsRow } from "@/lib/cms-types";

export default function SettingsManager() {
  const toast = useToast();
  const [items, setItems] = useState<CmsSettingsRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<CmsSettingsRow | null>(null);
  const [deleting, setDeleting] = useState<CmsSettingsRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api<{ settings: CmsSettingsRow[] }>("/api/admin/settings");
      setItems(res.settings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
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

  if (error) {
    return (
      <Card>
        <p className="text-[13px] text-error">Failed to load settings: {error}</p>
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
        title="Site Settings"
        description="Key-value settings exposed to the public API. These control default site behaviour and flags."
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add setting
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState message="No settings yet." />
      ) : (
        <div className="space-y-2">
          {items.map((s) => (
            <Card key={s.key} className="py-3.5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[13px] font-semibold text-accent-blue">
                    {s.key}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[12px] text-text-secondary">
                    {s.value || <span className="italic text-text-muted">empty</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(s)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setDeleting(s)}
                    aria-label="Delete setting"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(adding || editing) && (
        <SettingEditor
          setting={editing}
          existingKeys={items.map((s) => s.key)}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSaved={() => {
            setAdding(false);
            setEditing(null);
            load();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete setting"
        message={`Delete “${deleting?.key}”? If the public site uses this key, it will fall back to a sensible default.`}
onConfirm={async () => {
          if (!deleting) return;
          setBusyId(deleting.key);
          try {
            await api(`/api/admin/settings/${encodeURIComponent(deleting.key)}`, { method: "DELETE" });
            toast("Setting deleted", "success");
            await load();
          } catch (err) {
            toast(err instanceof Error ? err.message : "Delete failed", "error");
          } finally {
            setBusyId(null);
            setDeleting(null);
          }
        }}
        loading={busyId === deleting?.key}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

function SettingEditor({
  setting,
  existingKeys,
  onClose,
  onSaved,
}: {
  setting: CmsSettingsRow | null;
  existingKeys: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const isNew = !setting;
  const [key, setKey] = useState(setting?.key ?? "");
  const [value, setValue] = useState(setting?.value ?? "");

  const save = async () => {
    if (!key.trim()) {
      toast("Key is required", "error");
      return;
    }
    if (isNew && existingKeys.includes(key.trim())) {
      toast("A setting with this key already exists — use Edit instead.", "error");
      return;
    }
    setSaving(true);
    try {
      await api("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify({ key: key.trim(), value }),
      });
      toast("Setting saved", "success");
      onSaved();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? "Add a setting" : `Edit “${setting?.key ?? ""}”`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            <Save className="h-4 w-4" /> Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Key">
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="site_banner_enabled"
            readOnly={!isNew}
            className={!isNew ? "opacity-60" : ""}
          />
        </Field>
        <Field label="Value" hint="Leave empty to clear.">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="true"
            className="w-full resize-y rounded-lg border border-border-subtle bg-bg-card px-3 py-2.5 font-mono text-[13px] text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none"
            rows={4}
          />
        </Field>
      </div>
    </Modal>
  );
}
