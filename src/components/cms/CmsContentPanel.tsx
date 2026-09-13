"use client";

import { useEffect, useState } from "react";
import { BookOpen, Calendar, ExternalLink } from "lucide-react";
import { fmtDate } from "@/lib/api-client";
import type { CmsAnnouncement, CmsInstruction } from "@/lib/cms-types";

interface PublicContent {
  instructions: CmsInstruction[];
  announcements: CmsAnnouncement[];
}

/**
 * Renders CMS "Instructions" (getting-started guides) and latest
 * announcements, fetched live from the admin panel.
 */
export default function CmsContentPanel() {
  const [data, setData] = useState<PublicContent | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/public/content", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((d: PublicContent | null) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;
  if (!data) return null;
  if (!data.instructions.length && !data.announcements.length) return null;

  return (
    <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_360px]">
      {data.instructions.length > 0 && (
        <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-accent-blue" />
            <h2 className="text-[13px] font-semibold text-text-primary">
              Getting started
            </h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.instructions.map((ins) => (
              <div
                key={ins.id}
                className="rounded-lg border border-border-subtle bg-bg-base p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold text-text-primary">
                    {ins.title}
                  </p>
                  {ins.item_date && (
                    <span className="flex shrink-0 items-center gap-1 text-[10px] text-text-muted">
                      <Calendar className="h-3 w-3" />
                      {fmtDate(ins.item_date)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
                  {ins.description}
                </p>
                {ins.link_text && ins.link_url && (
                  <a
                    href={ins.link_url}
                    className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-accent-blue hover:underline"
                  >
                    {ins.link_text}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.announcements.length > 0 && (
        <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent-amber" />
            <h2 className="text-[13px] font-semibold text-text-primary">
              Official announcements
            </h2>
          </div>
          <ul className="space-y-2.5">
            {data.announcements.slice(0, 5).map((a) => (
              <li key={a.id} className="rounded-lg border border-border-subtle bg-bg-base p-3">
                <p className="text-[12px] font-semibold text-text-primary">{a.title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-text-secondary">
                  {a.message}
                </p>
                {a.link_text && a.link_url && (
                  <a
                    href={a.link_url}
                    className="mt-1 inline-block text-[12px] font-semibold text-accent-blue hover:underline"
                  >
                    {a.link_text}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}