"use client";

import { useState } from "react";
import { Trash2, ImagePlus } from "lucide-react";
import {
  Button,
  Field,
  Input,
  Modal,
  useToast,
} from "@/components/admin/ui";
import MediaPicker from "@/components/admin/MediaPicker";
import ContentBlocksEditor from "@/components/admin/ContentBlocksEditor";
import { api } from "@/lib/api-client";
import type { CmsSection, ContentBlock } from "@/lib/cms-types";
import { cn } from "@/lib/utils";

export default function SectionEditor({
  section,
  onClose,
  onSaved,
}: {
  section: CmsSection | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isNew = !section;
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [form, setForm] = useState({
    key: section?.key ?? "",
    title: section?.title ?? "",
    heading: section?.heading ?? "",
    subheading: section?.subheading ?? "",
    body: section?.body ?? ([] as ContentBlock[]),
    image_url: section?.image_url ?? "",
    button_text: section?.button_text ?? "",
    button_link: section?.button_link ?? "",
    enabled: section?.enabled ?? true,
    sort_order: section?.sort_order ?? 0,
  });

  const patch = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...(isNew ? { key: form.key } : {}),
        title: form.title,
        heading: form.heading,
        subheading: form.subheading,
        body: form.body,
        image_url: form.image_url,
        button_text: form.button_text,
        button_link: form.button_link,
        enabled: form.enabled,
        sort_order: form.sort_order,
        ...(isNew ? { status: "draft" as const } : {}),
      };
      if (isNew) {
        await api("/api/admin/sections", { method: "POST", body: JSON.stringify(payload) });
      } else {
        await api(`/api/admin/sections/${section.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      toast(isNew ? "Section created" : "Section saved", "success");
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
      title={isNew ? "New section" : `Edit “${section?.title ?? ""}”`}
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Key (identifier)">
            <Input
              value={form.key}
              onChange={(e) => patch("key", e.target.value)}
              placeholder="home, about, footer…"
              readOnly={!isNew}
              className={cn(!isNew && "opacity-60")}
            />
          </Field>
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => patch("title", e.target.value)}
              placeholder="Home"
            />
          </Field>
        </div>

        <Field label="Heading">
          <Input
            value={form.heading}
            onChange={(e) => patch("heading", e.target.value)}
            placeholder="Welcome to USDX AI"
          />
        </Field>

        <Field label="Subheading">
          <Input
            value={form.subheading}
            onChange={(e) => patch("subheading", e.target.value)}
            placeholder="Short tagline shown under the heading"
          />
        </Field>

        {/* Content blocks */}
        <ContentBlocksEditor
          value={form.body}
          onChange={(body) => patch("body", body)}
        />

        {/* Image */}
        <Field
          label="Section image"
          hint="Optional image shown with this section."
        >
          {form.image_url ? (
            <div className="relative overflow-hidden rounded-lg border border-border-subtle">
              <img
                src={form.image_url}
                alt=""
                className="h-32 w-full object-cover"
              />
              <div className="absolute right-2 top-2 flex gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPickerOpen(true)}
                >
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

        {/* Button */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Button text">
            <Input
              value={form.button_text}
              onChange={(e) => patch("button_text", e.target.value)}
              placeholder="Learn more"
            />
          </Field>
          <Field label="Button link">
            <Input
              value={form.button_link}
              onChange={(e) => patch("button_link", e.target.value)}
              placeholder="/dashboard or https://…"
            />
          </Field>
        </div>

        {/* Enabled */}
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => patch("enabled", e.target.checked)}
            className="h-4 w-4 accent-[var(--accent-blue)]"
          />
          <span className="text-[13px] text-text-secondary">
            Section is {form.enabled ? "enabled" : "disabled"} on the public site
          </span>
        </label>
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