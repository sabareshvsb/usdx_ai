import { BookOpen, FileText, Scale } from "lucide-react";
import type { SourceRef } from "@/lib/chat";

function renderIcon(source: string): React.ReactNode {
  const s = source.toLowerCase();
  if (s.includes("rule")) {
    return <Scale className="h-3 w-3 text-accent-blue" />;
  }
  if (s.includes("documentation")) {
    return <FileText className="h-3 w-3 text-accent-blue" />;
  }
  return <BookOpen className="h-3 w-3 text-accent-blue" />;
}

export default function SourceBadge({ source }: { source: SourceRef }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[6px] border border-border-subtle bg-bg-elevated px-2 py-0.5 text-[10px] font-medium text-text-muted">
      {renderIcon(source.source || source.title)}
      {source.title}
    </span>
  );
}
