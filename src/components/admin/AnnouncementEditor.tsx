"use client";

import { useState } from "react";
import { Button, Field, Input, Modal, Textarea, useToast } from "@/components/admin/ui";
import { api } from "@/lib/api-client";

export default function AnnouncementEditor({
  announcement,
  onClose,
  onSaved,
}: {
  announcement: { id: string; title: string; message: string; link_text: string; link_url: string } | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isNew = !announcement;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: announcement?.title ?? "",
    message: announcement?.message ?? "",
    link_text: announcement?.link_text ?? "",
    link_url: announcement?.link_url ?? "",
  });

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        message: form.message,
        link_text: form.link_text,
        link_url: form.link_url,
        ...(isNew ? { status: "draft" as const } : {}),
      };
      if (isNew) {
        await api("/api/admin/announcements", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else {
        await api(`/api/admin/announcements/${announcement.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      toast(isNew ? "Announcement created" : "Announcement saved", "success");
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
      title={isNew ? "New announcement" : `Edit “${announcement?.title ?? ""}”`}
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
        <Field label="Title" hint="Short, one-line headline shown to users.">
          <Input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Scheduled maintenance"
          />
        </Field>
        <Field label="Message">
          <Textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="We'll be doing a short maintenance window tonight at 22:00 UTC…"
            rows={3}
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Link text" hint="Optional button on this notice.">
            <Input
              value={form.link_text}
              onChange={(e) => setForm((f) => ({ ...f, link_text: e.target.value }))}
              placeholder="Learn more"
            />
          </Field>
          <Field label="Link URL">
            <Input
              value={form.link_url}
              onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))}
              placeholder="/dashboard or https://…"
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}