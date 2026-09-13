"use client";

import { Plus, Trash2, ChevronUp, ChevronDown, X } from "lucide-react";
import { Button, Input, Textarea } from "@/components/admin/ui";
import type { ContentBlock } from "@/lib/cms-types";

const BLOCK_TYPES = ["heading", "paragraph", "list"] as const;

export default function ContentBlocksEditor({
  value,
  onChange,
}: {
  value: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const addBlock = (type: ContentBlock["type"]) => {
    const block: ContentBlock =
      type === "list" ? { type: "list", items: [""] } : { type, text: "" };
    onChange([...value, block]);
  };

  const updateBlock = (i: number, next: ContentBlock) =>
    onChange(value.map((b, idx) => (idx === i ? next : b)));

  const removeBlock = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const moveBlock = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-medium text-text-secondary">
          Content blocks
        </span>
        <div className="flex gap-1">
          {BLOCK_TYPES.map((t) => (
            <Button key={t} size="sm" variant="secondary" onClick={() => addBlock(t)}>
              <Plus className="h-3.5 w-3.5" /> {t}
            </Button>
          ))}
        </div>
      </div>
      {value.length === 0 && (
        <p className="border border-dashed border-border-medium px-3 py-4 text-center text-[12px] text-text-muted">
          No blocks yet — add a heading, paragraph or list.
        </p>
      )}
      <div className="space-y-2">
        {value.map((block, i) => (
          <div
            key={i}
            className="rounded-lg border border-border-subtle bg-bg-elevated/40 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                {block.type}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded p-1 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
                  onClick={() => moveBlock(i, -1)}
                  aria-label="Move up"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded p-1 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
                  onClick={() => moveBlock(i, 1)}
                  aria-label="Move down"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded p-1 text-error/70 hover:bg-error/15 hover:text-error"
                  onClick={() => removeBlock(i)}
                  aria-label="Remove block"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {block.type === "heading" && (
              <Input
                value={block.text ?? ""}
                onChange={(e) => updateBlock(i, { type: "heading", text: e.target.value })}
                placeholder="Heading text"
              />
            )}
            {block.type === "paragraph" && (
              <Textarea
                value={block.text ?? ""}
                onChange={(e) =>
                  updateBlock(i, { type: "paragraph", text: e.target.value })
                }
                placeholder="Paragraph text"
                rows={3}
              />
            )}
            {block.type === "list" && (
              <div className="space-y-1.5">
                {block.items.map((item, j) => (
                  <div key={j} className="flex gap-1.5">
                    <Input
                      value={item}
                      onChange={(e) =>
                        updateBlock(i, {
                          type: "list",
                          items: block.items.map((x, k) => (k === j ? e.target.value : x)),
                        })
                      }
                      placeholder={`Item ${j + 1}`}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        updateBlock(i, {
                          type: "list",
                          items: block.items.filter((_, k) => k !== j),
                        })
                      }
                      aria-label="Remove item"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updateBlock(i, { type: "list", items: [...block.items, ""] })}
                >
                  <Plus className="h-3.5 w-3.5" /> Add item
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}