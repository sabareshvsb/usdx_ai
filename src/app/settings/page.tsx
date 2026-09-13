"use client";

import AppShell from "@/components/layout/AppShell";
import CmsAnnouncementBanner from "@/components/cms/CmsAnnouncementBanner";
import Reveal from "@/components/motion/Reveal";
import { Moon, Bell, Shield, Globe, User } from "lucide-react";

const settingSections = [
  { icon: User, title: "Profile", description: "Manage your display name and avatar", active: true },
  { icon: Bell, title: "Notifications", description: "Configure push and email notifications", active: true },
  { icon: Shield, title: "Security", description: "Two-factor authentication, session management", active: false },
  { icon: Moon, title: "Appearance", description: "Dark mode, accent colours, layout preferences", active: true },
  { icon: Globe, title: "Language", description: "Interface language and regional settings", active: true },
];

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="max-w-[700px] mx-auto">
        <CmsAnnouncementBanner />

        <Reveal>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-blue">
            Settings
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">
            Settings
          </h1>
          <p className="mt-2 text-[13px] text-text-muted">
            Manage your USDX AI preferences and account configuration.
          </p>
        </Reveal>

        <div className="mt-6 space-y-2">
          {settingSections.map((s, i) => (
            <Reveal key={s.title} delay={i * 50}>
              <button
                className="card-lift flex w-full items-center gap-4 rounded-[14px] border border-border-subtle bg-bg-card px-5 py-4 text-left hover:border-border-medium"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-bg-elevated transition-transform duration-300 group-hover:scale-110">
                  <s.icon className="h-5 w-5 text-text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-text-primary">{s.title}</p>
                  <p className="text-[12px] text-text-muted">{s.description}</p>
                </div>
                <div className={`h-2 w-2 rounded-full ${s.active ? "bg-success" : "bg-text-muted"}`} />
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
