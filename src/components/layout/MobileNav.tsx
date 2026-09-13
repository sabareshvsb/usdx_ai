"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Trophy,
  Wallet,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "USDX AI", href: "/dashboard?tab=ai", icon: MessageSquare, primary: true },
  { label: "Leaderboard", href: "/dashboard#leaders", icon: Trophy },
  { label: "Wallet", href: "/dashboard?tab=wallet", icon: Wallet },
  { label: "More", href: "/settings", icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle bg-bg-panel/90 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {items.map((item) => {
          const active = pathname === item.href.split("?")[0];
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-[10px] px-3 py-1.5 text-[10px] font-medium transition-[transform,color] duration-200 active:scale-90",
                active ? "text-accent-blue" : "text-text-muted",
                item.primary && !active && "text-text-secondary"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  active ? "text-accent-blue" : "text-text-muted",
                  item.primary && !active && "text-text-secondary"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
