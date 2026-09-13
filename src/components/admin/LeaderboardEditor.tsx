"use client";

import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button, Field, Input, Modal, useToast } from "@/components/admin/ui";
import MediaPicker from "@/components/admin/MediaPicker";
import { api } from "@/lib/api-client";
import type { CmsLeaderboardEntry } from "@/lib/cms-types";

export default function LeaderboardEditor({
  entry,
  onClose,
  onSaved,
}: {
  entry: CmsLeaderboardEntry | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isNew = !entry;
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [form, setForm] = useState({
    name: entry?.name ?? "",
    rank: entry?.rank ?? 0,
    business_volume: entry?.business_volume?.toString() ?? "",
    change_24h: entry?.change_24h?.toString() ?? "0",
    avatar_url: entry?.avatar_url ?? "",
    enabled: entry ? entry.enabled : true,
  });

  const patch = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.name.trim()) {
      toast("Participant name is required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        rank: Number(form.rank) || 0,
        business_volume: Number(form.business_volume) || 0,
        change_24h: Number(form.change_24h) || 0,
        avatar_url: form.avatar_url,
        enabled: form.enabled,
        ...(isNew ? { status: "draft" as const } : {}),
      };
      if (isNew) {
        await api("/api/admin/leaderboard", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else {
        await api(`/api/admin/leaderboard/${entry.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      toast(isNew ? "Participant added" : "Participant saved", "success");
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
      title={isNew ? "Add participant" : `Edit “${entry?.name ?? ""}”`}
      footer={
        <>
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
        <Field label="Participant name" hint="As shown on the public leaderboard.">
          <Input
            value={form.name}
            onChange={(e) => patch("name", e.target.value)}
            placeholder="Alex Anderson"
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Rank" hint="Position on the board (1 = #1).">
            <Input
              type="number"
              min={1}
              value={form.rank}
              onChange={(e) => patch("rank", e.target.valueAsNumber ?? 1)}
            />
          </Field>
          <Field label="Business Volume (USD)">
            <Input
              type="number"
              min={0}
              step="any"
              value={form.business_volume}
              onChange={(e) => patch("business_volume", e.target.value)}
              placeholder="125000"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="24H Change (%)" hint="Positive or negative. Shown with color.">
            <Input
              type="number"
              step="any"
              value={form.change_24h}
              onChange={(e) => patch("change_24h", e.target.value)}
              placeholder="12.5"
            />
          </Field>
          <Field label="Visible on public site">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border-subtle bg-bg-elevated/50 px-3 py-2.5">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => patch("enabled", e.target.checked)}
                className="h-4 w-4 accent-accent-blue"
              />
              <span className="text-[12px] text-text-secondary">Enabled</span>
            </label>
          </Field>
        </div>

        <Field label="Avatar" hint="Optional profile picture for the row.">
          {form.avatar_url ? (
            <div className="relative overflow-hidden rounded-lg border border-border-subtle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.avatar_url} alt="" className="h-24 w-full object-cover" />
              <div className="absolute right-2 top-2 flex gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => setPickerOpen(true)}>
                  Replace
                </Button>
                <Button size="sm" variant="danger" onClick={() => patch("avatar_url", "")}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPickerOpen(true)}
              className="w-full"
            >
              <ImagePlus className="h-4 w-4" /> Choose from media library
            </Button>
          )}
        </Field>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={form.avatar_url}
        onChange={(url) => patch("avatar_url", url)}
        onClear={() => patch("avatar_url", "")}
      />
    </Modal>
  );
}