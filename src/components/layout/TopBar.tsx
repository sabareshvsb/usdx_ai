"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Wifi } from "lucide-react";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";
import { TOKEN } from "@/lib/token";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import LiveBadge from "@/components/motion/LiveBadge";

const DASH_SECTIONS = ["hero", "overview", "leaders", "ecosystem"] as const;

const NAV = [
  { href: "/dashboard", label: "Overview", section: "overview" },
  { href: "/dashboard#leaders", label: "Rankings", section: "leaders" },
  { href: "/knowledge", label: "Knowledge", section: null },
  { href: "/docs", label: "Docs", section: null },
  { href: "/faq", label: "FAQ", section: null },
] as const;

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function TopBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [connected] = useState(true);
  const rafRef = useRef(0);
  const contract = shortAddr(TOKEN.contract);

  const activeSection = useScrollSpy(
    pathname === "/dashboard" ? DASH_SECTIONS : [],
    120
  );

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        setScrolled(window.scrollY > 12);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const isActive = (item: (typeof NAV)[number]) => {
    if (item.section) {
      if (pathname !== "/dashboard") return false;
      if (item.section === "overview") {
        return activeSection === "" || activeSection === "hero" || activeSection === "overview";
      }
      return activeSection === item.section;
    }
    return pathname === item.href;
  };

  const handleNavClick = (e: React.MouseEvent, item: (typeof NAV)[number]) => {
    setMenuOpen(false);
    if (!item.section || pathname !== "/dashboard") return;
    const id = item.section === "overview" ? "overview" : item.section;
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="scroll-progress"
        style={{ width: `${progress}%` }}
        aria-hidden
      />

      <header
        className={cn(
          "sticky top-0 z-30 flex h-14 shrink-0 items-center border-b bg-bg-base/80 px-4 backdrop-blur-xl transition-[box-shadow,background-color,border-color] duration-300 lg:px-6",
          scrolled
            ? "border-border-medium shadow-lg shadow-black/5"
            : "border-border-subtle"
        )}
      >
        {/* Mobile logo + hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
            <Logo compact />
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className={cn("hamburger", menuOpen && "is-open")}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        {/* Desktop branding */}
        <div className="hidden lg:flex items-center gap-2.5">
          <span className="text-[13px] font-semibold tracking-tight text-text-secondary animated-gradient-text">
            USDX AI
          </span>
          <span className="text-[11px] text-text-muted">·</span>
          <LiveBadge label="Live Event" />
        </div>

        {/* Desktop nav */}
        <nav className="ml-8 hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              className={cn(
                "nav-link text-[13px] font-medium text-text-muted",
                isActive(item) && "is-active"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {/* Network indicator (Base only) */}
          <div className="flex items-center gap-2 rounded-[10px] border border-border-subtle bg-bg-card px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-[pulseDot_2s_ease-in-out_infinite]" />
            <span className="hidden sm:inline text-[12px] font-medium text-text-secondary">
              Base
            </span>
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="glass-strong mobile-menu z-40 border-b border-border-subtle px-4 pb-5 pt-2 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-3 text-[14px] font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary",
                  isActive(item) && "text-accent-blue"
                )}
              >
                {item.label}
                {item.section && <LiveBadge />}
              </Link>
            ))}
            <Link
              href="/admin"
              className="mt-2 flex items-center justify-between rounded-lg px-3 py-3 text-[14px] font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
            >
              Admin Panel
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}