"use client";

import { useEffect, useState } from "react";
import { Search, Upload, X, Check } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button, Input, Modal, useToast } from "@/components/admin/ui";
import type { CmsMedia } from "@/lib/cms-types";
import { cn } from "@/lib/utils";

/**
 * Media library picker — select an image from the CMS media library
 * to use in sections / instructions.
 */
export default function MediaPicker({
  open,
  onClose,
  value,
  onChange,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (url: string) => void;
  onClear?: () => void;
}) {
  const toast = useToast();
  const [media, setMedia] = useState<CmsMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setSelected(value);
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await api<{ media: CmsMedia[] }>("/api/admin/media?limit=200");
        if (!cancelled) setMedia(res.media);
      } catch {
        if (!cancelled) toast("Failed to load media library", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void Promise.resolve().then(run);
    return () => {
      cancelled = true;
    };
  }, [open, toast]);

  const filtered = media.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("files", f));
    form.append("folder", "picked");
    try {
      const res = await api<{ media: CmsMedia[] }>("/api/admin/media", {
        method: "POST",
        body: form,
      });
      setMedia((prev) => [...res.media, ...prev]);
      if (res.media[0]) setSelected(res.media[0].url);
      toast("Image uploaded", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choose an image"
      wide
      footer={
        <>
          {onClear && value && (
            <Button
              variant="ghost"
              onClick={() => {
                onClear?.();
                setSelected("");
                onClose();
              }}
            >
              Remove image
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onChange(selected);
              onClose();
            }}
            disabled={!selected}
          >
            Use this image
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images…"
              className="pl-9"
            />
          </div>
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent-blue px-4 text-[13px] font-medium text-white hover:brightness-110">
            <Upload className="h-4 w-4" />
            Upload
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        </div>

        {loading ? (
          <p className="py-8 text-center text-[13px] text-text-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-text-muted">
            No images found. Upload one above.
          </p>
        ) : (
          <div className="grid max-h-[50vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {filtered.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(m.url)}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg border-2 transition-colors",
                  selected === m.url
                    ? "border-accent-blue"
                    : "border-border-subtle hover:border-accent-blue/40"
                )}
              >
                <img
                  src={m.url}
                  alt={m.alt_text || m.name}
                  className="h-full w-full object-cover"
                />
                {selected === m.url && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-blue text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}