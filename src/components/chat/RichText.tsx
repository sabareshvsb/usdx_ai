import { Fragment } from "react";

type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; text: string };

function unescape(text: string): string {
  return text
    .replace(/&rarr;/g, "→")
    .replace(/&ndash;/g, "–")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&ldquo;/g, "\u201c")
    .replace(/&rdquo;/g, "\u201d")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

function parseInline(raw: string) {
  const parts = raw.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-text-primary">{unescape(part.slice(2, -2))}</strong>;
    }
    return <Fragment key={i}>{unescape(part)}</Fragment>;
  });
}

function parseBlocks(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let current: Block | null = null;

  const flush = () => {
    if (current) blocks.push(current);
    current = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }

    if (line.startsWith("### ")) { flush(); current = { type: "h3", text: line.slice(4) }; continue; }
    if (line.startsWith("## ")) { flush(); current = { type: "h2", text: line.slice(3) }; continue; }
    if (line.startsWith("# ")) { flush(); current = { type: "h2", text: line.slice(2) }; continue; }

    if (/^[-•*]\s+/.test(line)) {
      const item = line.replace(/^[-•*]\s+/, "");
      if (current?.type === "ul") { current.items.push(item); }
      else { flush(); current = { type: "ul", items: [item] }; }
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const item = line.replace(/^\d+[.)]\s+/, "");
      if (current?.type === "ol") { current.items.push(item); }
      else { flush(); current = { type: "ol", items: [item] }; }
      continue;
    }

    flush();
    current = { type: "p", text: line };
  }
  flush();
  return blocks;
}

export default function RichText({ content }: { content: string }) {
  const blocks = parseBlocks(content);
  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h3 key={i} className="pt-1 text-[14px] font-bold tracking-tight text-text-primary">
                {parseInline(block.text)}
              </h3>
            );
          case "h3":
            return (
              <h4 key={i} className="text-[13px] font-semibold tracking-tight text-text-primary">
                {parseInline(block.text)}
              </h4>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-1.5">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-2 text-[12.5px] leading-relaxed text-text-primary/85">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent-blue" />
                    <span>{parseInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-1.5">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-2 text-[12.5px] leading-relaxed text-text-primary/85">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-bg-card text-[10px] font-semibold text-text-muted">
                      {j + 1}
                    </span>
                    <span>{parseInline(item)}</span>
                  </li>
                ))}
              </ol>
            );
          default:
            return (
              <p key={i} className="text-[12.5px] leading-relaxed text-text-primary/85">
                {parseInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
