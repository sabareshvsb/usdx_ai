"use client";

import AppShell from "@/components/layout/AppShell";
import KnowledgeCard from "@/components/ui/KnowledgeCard";
import CmsAnnouncementBanner from "@/components/cms/CmsAnnouncementBanner";
import CmsContentPanel from "@/components/cms/CmsContentPanel";
import CmsSectionsRenderer from "@/components/cms/CmsSectionsRenderer";
import Reveal from "@/components/motion/Reveal";
import { knowledgeCategories } from "@/lib/knowledge";
import { Search, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function KnowledgePage() {
  return (
    <AppShell>
      <div className="max-w-[1100px] mx-auto">
        <CmsAnnouncementBanner />

        <Reveal>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-blue">
                Knowledge Base
              </span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">
                USDX Knowledge Base
              </h1>
              <p className="mt-2 text-[13px] text-text-muted leading-relaxed">
                Editorial, well-organised documentation for the entire USDX ecosystem.
              </p>
            </div>
            <Link
              href="/dashboard?tab=ai"
              className="btn-feel inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-accent-blue/10 border border-accent-blue/20 px-4 py-2 text-[12px] font-semibold text-accent-blue transition-colors hover:-translate-y-0.5 hover:bg-accent-blue/20"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Ask USDX AI
            </Link>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-5 flex items-center gap-2 rounded-[12px] border border-border-subtle bg-bg-card px-3.5 py-2.5 sm:max-w-sm">
            <Search className="h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search the knowledge base…"
              className="flex-1 bg-transparent text-[13px] text-text-primary outline-none placeholder:text-text-muted/60"
            />
          </div>
        </Reveal>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {knowledgeCategories.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 70}>
              <KnowledgeCard category={cat} />
            </Reveal>
          ))}
        </div>

        <div className="mt-10">
          <CmsSectionsRenderer />
        </div>

        <CmsContentPanel />
      </div>
    </AppShell>
  );
}
