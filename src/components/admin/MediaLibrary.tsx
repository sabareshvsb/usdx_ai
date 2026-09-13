"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Upload,
  Search,
  Trash2,
  Pencil,
  Image as ImageIcon,
  FolderOpen,
} from "lucide-react";
import { api, fmtBytes, optimizeImage } from "@/lib/api-client";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Spinner,
  useToast,
} from "@/components/admin/ui";
import type { CmsMedia } from "@/lib/cms-types";
import { cn } from "@/lib/utils";

export default function MediaLibrary() {
  const toast = useToast();
  const [items, setItems] = useState<CmsMedia[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [editing, setEditing] = useState<CmsMedia | null>(null);
  const [deleting, setDeleting] = useState<CmsMedia | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api<{ media: CmsMedia[] }>("/api/admin/media?limit=200");
      setItems(res.media);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
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

  const folders = useMemo(() => {
    const set = new Set<string>();
    items?.forEach((m) => set.add(m.folder));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter(
      (m) =>
        (folder === "all" || m.folder === folder) &&
        m.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, folder, search]);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setUploading(true);
    try {
      const form = new FormData();
      for (const file of Array.from(fileList)) {
        const { blob } = await optimizeImage(file);
        const mime = blob.type || file.type || "image/jpeg";
        const name = file.name.replace(/\.[^.]+$/, "") || "image";
        const out = new File([blob], `${name}.${mime === "image/png" ? "png" : "jpg"}`, {
          type: mime,
        });
        form.append("files", out);
      }
      form.append("folder", folder === "all" ? "uncategorized" : folder);
      await api<{ media: CmsMedia[] }>("/api/admin/media", { method: "POST", body: form });
      toast(`${fileList.length} image${fileList.length > 1 ? "s" : ""} uploaded`, "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await api(`/api/admin/media/${deleting.id}`, { method: "DELETE" });
      toast("File deleted", "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setBusyId(null);
      setDeleting(null);
      setEditing(null);
    }
  };

  if (error) {
    return (
      <Card>
        <p className="text-[13px] text-error">Failed to load media: {error}</p>
        <Button className="mt-3" onClick={load}>
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Media Library"
        description="Upload and manage images used across the site. Images are optimized automatically on upload."
        actions={
          <label
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent-blue px-4 text-[13px] font-medium text-white hover:brightness-110"
          >
            {uploading ? <Spinner /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload images"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        }
      />

      {/* Drop zone */}
      <div
        className={cn(
          "rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors",
          dragOver
            ? "border-accent-blue bg-accent-blue/5"
            : "border-border-medium bg-bg-panel"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <p className="text-[13px] text-text-secondary">
          Drag & drop images here, or{" "}
          <label className="cursor-pointer font-medium text-accent-blue hover:underline">
            browse
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </p>
        <p className="mt-0.5 text-[11px] text-text-muted">
          PNG, JPG, WEBP, GIF, AVIF · up to 12MB · auto-compressed
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="pl-9"
          />
        </div>
        <Select value={folder} onChange={(e) => setFolder(e.target.value)} className="sm:w-56">
          <option value="all">All folders</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </Select>
      </div>

      {!items ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ImageIcon className="h-8 w-8 text-text-muted" />
            <p className="text-[13px] text-text-muted">
              {items.length === 0
                ? "No media uploaded yet."
                : "No files match your filters."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((m) => (
            <Card key={m.id} className="group overflow-hidden p-0">
              <div className="relative aspect-video w-full overflow-hidden bg-bg-elevated">
                <img
                  src={m.url}
                  alt={m.alt_text || m.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(m)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleting(m)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {m.is_banner && (
                  <span className="absolute left-2 top-2">
                    <Badge tone="blue">banner</Badge>
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-[12px] font-medium text-text-primary" title={m.name}>
                  {m.name}
                </p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-text-muted">
                  <FolderOpen className="h-3 w-3" />
                  <span className="truncate">{m.folder}</span>
                  <span className="ml-auto shrink-0 tabular-nums">{fmtBytes(m.size_bytes)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <MediaEditModal
          media={editing}
          folders={folders}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
          onDelete={() => setDeleting(editing)}
          busy={busyId === editing.id}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete file"
        message={`Delete “${deleting?.name}”? This will remove the image from the library permanently.`}
        loading={busyId === deleting?.id}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

function MediaEditModal({
  media,
  folders,
  onClose,
  onSaved,
  onDelete,
  busy,
}: {
  media: CmsMedia;
  folders: string[];
  onClose: () => void;
  onSaved: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [form, setForm] = useState({
    name: media.name,
    alt_text: media.alt_text ?? "",
    folder: media.folder,
    is_banner: media.is_banner,
  });

  const save = async () => {
    setSaving(true);
    try {
      await api(`/api/admin/media/${media.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          alt_text: form.alt_text,
          folder: form.folder,
          is_banner: form.is_banner,
        }),
      });
      toast("Saved", "success");
      onSaved();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const replace = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setReplacing(true);
    try {
      const { blob } = await optimizeImage(fileList[0]);
      const formData = new FormData();
      formData.append("file", new File([blob], fileList[0].name, { type: blob.type }));
      await api(`/api/admin/media/${media.id}`, { method: "PATCH", body: formData });
      toast("Image replaced", "success");
      onSaved();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Replace failed", "error");
    } finally {
      setReplacing(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit media"
      footer={
        <>
          <Button variant="danger" onClick={onDelete} loading={busy}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <img
          src={media.url}
          alt={media.alt_text || media.name}
          className="h-40 w-full rounded-lg border border-border-subtle object-cover"
        />
        <Field label="Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Alt text" hint="Describes the image (accessibility, SEO).">
          <Input
            value={form.alt_text}
            onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Folder">
            <Select value={form.folder} onChange={(e) => setForm({ ...form, folder: e.target.value })}>
              {folders.includes(form.folder) && <option value={form.folder}>{form.folder}</option>}
              <option value="uncategorized">uncategorized</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </Field>
          <label className="flex items-end gap-2 pb-2">
            <input
              type="checkbox"
              checked={form.is_banner}
              onChange={(e) => setForm({ ...form, is_banner: e.target.checked })}
              className="h-4 w-4 accent-[var(--accent-blue)]"
            />
            <span className="text-[13px] text-text-secondary">Use as banner</span>
          </label>
        </div>
        <Field label="Replace image">
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-bg-elevated px-4 text-[13px] font-medium text-text-primary hover:border hover:border-accent-blue/40">
            {replacing ? <Spinner /> : <Upload className="h-4 w-4" />}
            {replacing ? "Replacing…" : "Choose a new file"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => replace(e.target.files)}
            />
          </label>
        </Field>
        <div className="flex flex-wrap gap-1.5 text-[11px] text-text-muted">
          <Badge>{media.mime_type}</Badge>
          <Badge>{fmtBytes(media.size_bytes)}</Badge>
          <Badge>{media.width ? `${media.width}×${media.height}` : "size unknown"}</Badge>
        </div>
      </div>
    </Modal>
  );
}