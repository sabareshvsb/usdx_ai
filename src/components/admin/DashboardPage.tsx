"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Blocks, BookOpen, Bell, Image as ImageIcon, Megaphone } from "lucide-react";
import { api, fmtDate } from "@/lib/api-client";
import {
  Card,
  PageHeader,
  Spinner,
  Badge,
  EmptyState,
} from "@/components/admin/ui";
import type {
  CmsSection,
  CmsInstruction,
  CmsAnnouncement,
  CmsMedia,
} from "@/lib/cms-types";

export default function DashboardPage() {
  const [data, setData] = useState<{
    sections: CmsSection[];
    instructions: CmsInstruction[];
    announcements: CmsAnnouncement[];
    media: CmsMedia[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, i, a, m] = await Promise.all([
          api<{ sections: CmsSection[] }>("/api/admin/sections"),
          api<{ instructions: CmsInstruction[] }>("/api/admin/instructions"),
          api<{ announcements: CmsAnnouncement[] }>("/api/admin/announcements"),
          api<{ media: CmsMedia[] }>("/api/admin/media?limit=5"),
        ]);
        if (!cancelled) {
          setData({
            sections: s.sections,
            instructions: i.instructions,
            announcements: a.announcements,
            media: m.media,
          });
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <Card>
        <p className="text-[13px] text-error">Failed to load overview: {error}</p>
      </Card>
    );
  }
  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const published = (items: { status: string }[]) =>
    items.filter((x) => x.status === "published").length;

  const stats = [
    {
      label: "Sections",
      value: data.sections.length,
      sub: `${published(data.sections)} published`,
      href: "/admin/sections",
      icon: Blocks,
      color: "text-accent-blue bg-accent-blue/10",
    },
    {
      label: "Instructions",
      value: data.instructions.length,
      sub: `${published(data.instructions)} published`,
      href: "/admin/instructions",
      icon: BookOpen,
      color: "text-accent-cyan bg-accent-cyan/10",
    },
    {
      label: "Announcements",
      value: data.announcements.length,
      sub: `${published(data.announcements)} published`,
      href: "/admin/announcements",
      icon: Bell,
      color: "text-accent-amber bg-accent-amber/10",
    },
    {
      label: "Media files",
      value: data.media.length < 5 ? data.media.length : "5+",
      sub: "in media library",
      href: "/admin/media",
      icon: ImageIcon,
      color: "text-success bg-success/10",
    },
  ];

  const recent = [
    ...data.sections.map((s) => ({ kind: "Section", name: s.title, at: s.updated_at, href: "/admin/sections" })),
    ...data.instructions.map((i) => ({ kind: "Instruction", name: i.title, at: i.updated_at, href: "/admin/instructions" })),
    ...data.announcements.map((a) => ({ kind: "Announcement", name: a.title, at: a.updated_at, href: "/admin/announcements" })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        description="Overview of your website content. Published items appear on the public site immediately."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="block">
            <Card className="h-full transition-colors hover:border-accent-blue/40">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}
                >
                  <s.icon className="h-[18px] w-[18px]" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tabular-nums text-text-primary">
                {s.value}
              </p>
              <p className="mt-0.5 text-[12px] font-medium text-text-secondary">
                {s.label}
              </p>
              <p className="text-[11px] text-text-muted">{s.sub}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/sections">
          <Badge tone="blue">Edit sections</Badge>
        </Link>
        <Link href="/admin/instructions">
          <Badge tone="blue">New instruction</Badge>
        </Link>
        <Link href="/admin/announcements">
          <Badge tone="blue">New announcement</Badge>
        </Link>
        <Link href="/admin/media">
          <Badge tone="blue">Upload images</Badge>
        </Link>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-accent-blue" />
            <h2 className="text-[13px] font-semibold text-text-primary">
              Recently updated
            </h2>
          </div>
          {recent.length === 0 ? (
            <EmptyState message="Nothing here yet — create your first content above." />
          ) : (
            <ul className="divide-y divide-border-subtle">
              {recent.map((r, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <Badge>{r.kind}</Badge>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-text-primary">
                    {r.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-text-muted">
                    {fmtDate(r.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-accent-cyan" />
            <h2 className="text-[13px] font-semibold text-text-primary">
              Latest uploads
            </h2>
          </div>
          {data.media.length === 0 ? (
            <EmptyState message="No media yet. Upload images from the Media Library." />
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {data.media.map((m) => (
                <img
                  key={m.id}
                  src={m.url}
                  alt={m.alt_text || m.name}
                  className="h-16 w-full rounded-lg border border-border-subtle object-cover"
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}