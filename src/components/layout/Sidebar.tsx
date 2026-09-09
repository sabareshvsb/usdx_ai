"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Shield,
  TrendingUp,
  Wallet,
  ArrowLeftRight,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "USDX AI", href: "/dashboard?tab=ai", icon: MessageSquare },
  { label: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { label: "Staking", href: "/dashboard?tab=staking", icon: Shield },
  { label: "Compounding", href: "/dashboard?tab=compound", icon: TrendingUp },
  { label: "Wallet", href: "/dashboard?tab=wallet", icon: Wallet },
  { label: "Transactions", href: "/dashboard?tab=tx", icon: ArrowLeftRight },
  { label: "Analytics", href: "/dashboard?tab=analytics", icon: BarChart3 },
  { label: "Announcements", href: "/dashboard?tab=announcements", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col border-r border-border-subtle bg-bg-panel transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-border-subtle",
            collapsed ? "justify-center px-2" : "gap-2.5 px-5"
          )}
        >
          <Logo showWordmark={!collapsed} compact={collapsed} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href.split("?")[0] + "?");
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                    collapsed && "justify-center px-2",
                    active
                      ? "bg-accent-blue/10 text-accent-blue"
                      : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      active ? "text-accent-blue" : "text-text-muted group-hover:text-text-secondary"
                    )}
                  />
                  {!collapsed &&
                    (item.label === "USDX AI" ? (
                      <span className="animated-gradient-text font-bold">{item.label}</span>
                    ) : (
                      <span>{item.label}</span>
                    ))}
                  {active && !collapsed && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-blue" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-border-subtle px-3 py-3">
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue to-accent-cyan text-[11px] font-bold text-white">
              U
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-text-primary">
                  USDXSMART
                </p>
                <p className="truncate font-mono text-[11px] text-text-muted">
                  0xf386...e13a
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                className="rounded-md p-1 text-text-muted transition-colors hover:text-text-secondary"
                aria-label="Disconnect"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-[72px] z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border-medium bg-bg-card text-text-muted transition-colors hover:border-accent-blue/40 hover:text-text-primary"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* Spacer */}
      <div
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      />
    </>
  );
}
