"use client";

import Link from "next/link";
import { ChevronDown, Wifi } from "lucide-react";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";import { cn } from "@/lib/utils";
import { useState } from "react";
import { TOKEN } from "@/lib/token";

const networks = [
  { name: "Base", color: "bg-[#0052ff]" },
  { name: "Ethereum", color: "bg-[#627eea]" },
  { name: "BSC", color: "bg-[#f0b90b]" },
];

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function TopBar() {
  const [networkOpen, setNetworkOpen] = useState(false);
  const [connected] = useState(true);
  const contract = shortAddr(TOKEN.contract);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border-subtle bg-bg-base/80 px-4 backdrop-blur-xl lg:px-6">
      {/* Mobile logo */}
      <div className="lg:hidden">
        <Link href="/dashboard">
          <Logo compact className="lg:hidden" />
        </Link>
      </div>

      {/* Desktop branding */}
      <div className="hidden lg:flex items-center gap-2.5">
        <span className="text-[13px] font-semibold tracking-tight text-text-secondary animated-gradient-text">
          USDX AI
        </span>
        <span className="text-[11px] text-text-muted">·</span>
        <span className="text-[11px] text-text-muted">
          {TOKEN.symbol} / {TOKEN.quote}
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Network selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNetworkOpen((o) => !o)}
            className="flex items-center gap-2 rounded-[10px] border border-border-subtle bg-bg-card px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:border-border-medium hover:text-text-primary"
          >
            <div className="h-2 w-2 rounded-full bg-[#0052ff]" />
            <span className="hidden sm:inline">Base</span>
            <ChevronDown className="h-3 w-3 text-text-muted" />
          </button>
          {networkOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-[12px] border border-border-subtle bg-bg-card p-1 shadow-xl animate-fade-in">
              {networks.map((n) => (
                <button
                  key={n.name}
                  onClick={() => setNetworkOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-[12px] text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
                >
                  <div className={cn("h-2 w-2 rounded-full", n.color)} />
                  {n.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Token contract indicator */}
        {connected && (
          <div className="hidden sm:flex items-center gap-2 rounded-[10px] border border-accent-blue/20 bg-accent-blue/8 px-3 py-1.5">
            <Wifi className="h-3 w-3 text-accent-blue" />
            <span className="font-mono text-[12px] font-medium text-accent-blue">
              {contract}
            </span>
          </div>
        )}

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
