"use client";

import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import type { CmsAnnouncement } from "@/lib/cms-types";

const DISMISS_KEY = "usdx_cms_announcement_dismissed";

interface PublicContent {
  announcements: CmsAnnouncement[];
}

/**
 * Shows the latest published CMS announcement as a dismissible banner.
 * Dismissal is remembered locally per device.
 */
export default function CmsAnnouncementBanner() {
  const [ann, setAnn] = useState<CmsAnnouncement | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/public/content", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PublicContent | null) => {
        if (cancelled) return;
        if (data?.announcements?.length) {
          const a = data.announcements[0];
          let isDismissed = false;
          try {
            isDismissed = localStorage.getItem(DISMISS_KEY) === a.id;
          } catch {
            /* ignore */
          }
          setDismissed(isDismissed);
          setAnn(a);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="skeleton mb-4 h-14 rounded-xl" aria-hidden />;
  }

  if (!ann || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, ann.id);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-accent-blue/25 bg-accent-blue/10 px-4 py-3">
      <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-accent-blue" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-text-primary">{ann.title}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-text-secondary">
          {ann.message}
        </p>
        {ann.link_text && ann.link_url && (
          <a
            href={ann.link_url}
            className="mt-1 inline-block text-[12px] font-semibold text-accent-blue hover:underline"
          >
            {ann.link_text}
          </a>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded-md p-1 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}