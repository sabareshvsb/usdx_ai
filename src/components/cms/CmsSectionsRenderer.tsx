"use client";

import { ExternalLink } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { usePublicContent } from "@/hooks/usePublicContent";
import type { ContentBlock } from "@/lib/cms-types";
import { cn } from "@/lib/utils";

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h4 className="mt-4 text-[15px] font-semibold text-text-primary first:mt-0">
          {block.text}
        </h4>
      );
    case "paragraph":
      return (
        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary first:mt-0">
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul className="mt-2 space-y-1.5 first:mt-0">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-text-secondary">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-cyan" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "divider":
      return <hr className="my-4 border-border-subtle" />;
    default:
      return null;
  }
}

function SectionCard({
  title,
  heading,
  subheading,
  body,
  image_url,
  button_text,
  button_link,
  index,
}: {
  title: string;
  heading: string;
  subheading: string;
  body: ContentBlock[];
  image_url: string;
  button_text: string;
  button_link: string;
  index: number;
}) {
  return (
    <Reveal delay={index % 3 * 90}>
      <article className="card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg-card">
        {image_url && (
          <div className="img-zoom-wrap relative aspect-[16/7] border-b border-border-subtle bg-bg-elevated">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image_url}
              alt={heading || title}
              loading="lazy"
              decoding="async"
              className="img-zoom h-full w-full object-cover"
            />
            <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
              {title}
            </span>
          </div>
        )}
        <div className="flex flex-1 flex-col p-5">
          {!image_url && (
            <span className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-cyan">
              {title}
            </span>
          )}
          <h3 className="text-[17px] font-bold leading-snug text-text-primary">
            {heading}
          </h3>
          {subheading && (
            <p className="mt-1 text-[12px] font-medium text-text-muted">
              {subheading}
            </p>
          )}
          <div className="mt-3 flex-1">
            {body.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
          {button_text && button_link && (
            <a
              href={button_link}
              target={button_link.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="btn-feel mt-5 inline-flex items-center gap-1.5 self-start rounded-lg bg-gradient-to-r from-accent-blue to-accent-cyan px-4 py-2 text-[12px] font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              {button_text}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </article>
    </Reveal>
  );
}

export default function CmsSectionsRenderer({
  className = "",
}: {
  className?: string;
}) {
  const { data, loading } = usePublicContent();

  if (loading && !data?.sections?.length) {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-56 rounded-2xl" />
        ))}
      </div>
    );
  }

  const sections = data?.sections ?? [];
  if (sections.length === 0) return null;

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {sections.map((section, i) => (
        <SectionCard
          key={section.key}
          title={section.title}
          heading={section.heading}
          subheading={section.subheading}
          body={section.body}
          image_url={section.image_url}
          button_text={section.button_text}
          button_link={section.button_link}
          index={i}
        />
      ))}
    </div>
  );
}