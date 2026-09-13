"use client";

import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button, Field, Input, Modal, Textarea, useToast } from "@/components/admin/ui";
import MediaPicker from "@/components/admin/MediaPicker";
import { api } from "@/lib/api-client";
import type { CmsInstruction } from "@/lib/cms-types";

export default function InstructionEditor({
  instruction,
  onClose,
  onSaved,
}: {
  instruction: CmsInstruction | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isNew = !instruction;
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [form, setForm] = useState({
    title: instruction?.title ?? "",
    description: instruction?.description ?? "",
    item_date: instruction?.item_date ?? "",
    link_text: instruction?.link_text ?? "",
    link_url: instruction?.link_url ?? "",
    image_url: instruction?.image_url ?? "",
    sort_order: instruction?.sort_order ?? 0,
  });

  const patch = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        item_date: form.item_date || null,
        link_text: form.link_text,
        link_url: form.link_url,
        image_url: form.image_url,
        sort_order: form.sort_order,
        ...(isNew ? { status: "draft" as const } : {}),
      };
      if (isNew) {
        await api("/api/admin/instructions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else {
        await api(`/api/admin/instructions/${instruction.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      toast(isNew ? "Instruction created" : "Instruction saved", "success");
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
      title={isNew ? "New instruction" : `Edit “${instruction?.title ?? ""}”`}
      wide
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
        <Field label="Title">
          <Input
            value={form.title}
            onChange={(e) => patch("title", e.target.value)}
            placeholder="Set up your wallet"
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={(e) => patch("description", e.target.value)}
            placeholder="Explain the step in a sentence or two…"
            rows={3}
          />
        </Field>
        <Field label="Date" hint="Optional date shown alongside the step.">
          <Input
            type="date"
            value={form.item_date ?? ""}
            onChange={(e) => patch("item_date", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Link text" hint="Optional button on this step.">
            <Input
              value={form.link_text}
              onChange={(e) => patch("link_text", e.target.value)}
              placeholder="Go to staking"
            />
          </Field>
          <Field label="Link URL">
            <Input
              value={form.link_url}
              onChange={(e) => patch("link_url", e.target.value)}
              placeholder="/dashboard or https://…"
            />
          </Field>
        </div>

        <Field label="Image" hint="Optional image shown with this instruction.">
          {form.image_url ? (
            <div className="relative overflow-hidden rounded-lg border border-border-subtle">
              <img src={form.image_url} alt="" className="h-32 w-full object-cover" />
              <div className="absolute right-2 top-2 flex gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => setPickerOpen(true)}>
                  Replace
                </Button>
                <Button size="sm" variant="danger" onClick={() => patch("image_url", "")}>
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
        value={form.image_url}
        onChange={(url) => patch("image_url", url)}
        onClear={() => patch("image_url", "")}
      />
    </Modal>
  );
}