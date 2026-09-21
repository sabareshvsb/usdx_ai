import Link from "next/link";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="shrink-0 border-t border-border-subtle bg-bg-base/80 px-4 py-4 lg:px-6">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-[11px] text-text-muted">
          USDX AI · USDXSMART Token Intelligence
        </p>
        <Link
          href="mailto:usdxai@gmail.com"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:text-accent-blue"
        >
          <Mail className="h-3.5 w-3.5" />
          usdxai@gmail.com
        </Link>
      </div>
    </footer>
  );
}