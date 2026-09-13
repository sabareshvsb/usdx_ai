"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Blocks,
  BookOpen,
  Bell,
  Trophy,
  Image,
  Settings,
  UserCircle,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";
import type { AdminUser } from "@/lib/cms-types";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Website Sections", href: "/admin/sections", icon: Blocks },
  { label: "Instructions", href: "/admin/instructions", icon: BookOpen },
  { label: "Announcements", href: "/admin/announcements", icon: Bell },
  { label: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
  { label: "Media Library", href: "/admin/media", icon: Image },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Account", href: "/admin/account", icon: UserCircle },
];

export default function AdminShell({
  admin,
  children,
}: {
  admin: AdminUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const nav = (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
              active
                ? "bg-accent-blue/10 text-accent-blue"
                : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            )}
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
            {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-blue" />}
          </Link>
        );
      })}

      <a
        href="/dashboard"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
      >
        <ExternalLink className="h-[18px] w-[18px]" />
        View public site
      </a>
    </nav>
  );

  const footer = (
    <div className="border-t border-border-subtle px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue to-accent-cyan text-[11px] font-bold text-white">
          {(admin.name ?? "A").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium text-text-primary">{admin.name}</p>
          <p className="truncate text-[11px] text-text-muted">{admin.email}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-error/15 hover:text-error"
          title="Log out"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-border-subtle bg-bg-panel lg:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-border-subtle px-5">
          <Logo showWordmark />
        </div>
        {nav}
        {footer}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-bg-panel animate-slide-right">
            <div className="flex h-14 items-center justify-between border-b border-border-subtle px-5">
              <Logo showWordmark />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 text-text-muted hover:text-text-primary"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[240px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border-subtle bg-bg-panel/90 px-4 backdrop-blur lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-text-muted hover:bg-bg-elevated hover:text-text-primary lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span className="text-[13px] font-semibold text-text-primary">
              USDX CMS
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-accent-blue/10 px-2.5 py-1 text-[11px] font-medium text-accent-blue sm:inline">
              Admin
            </span>
          </div>
        </header>

        <main className="flex-1 bg-bg-base p-4 pb-24 sm:p-6 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}