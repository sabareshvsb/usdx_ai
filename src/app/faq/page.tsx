"use client";

import AppShell from "@/components/layout/AppShell";
import CmsAnnouncementBanner from "@/components/cms/CmsAnnouncementBanner";
import Reveal from "@/components/motion/Reveal";
import { HelpCircle, MessageSquare } from "lucide-react";
import Link from "next/link";

const faqs = [
  { q: "What is USDX?", a: "USDX is a stable, yield-bearing digital asset designed for long-term stability and predictable returns, supported by a full ecosystem of staking, compounding, swaps, an affiliate program and a tiered rank system.", category: "Overview" },
  { q: "How do I get started with USDX?", a: "Connect a supported wallet, acquire USDX, and follow the onboarding guidance in the dashboard. Eligibility and minimum entry amounts follow the official project rules.", category: "Getting Started" },
  { q: "What is staking?", a: "Staking lets you lock up USDX to earn yield over a defined period. Rewards accrue based on your staked balance and current rank, and are reinforced by auto-compounding.", category: "Staking" },
  { q: "How does compounding work?", a: "Compounding automatically reinvests earned rewards back into your staked balance, so your position grows exponentially over time. The compounding schedule determines how frequently yields accrue.", category: "Compounding" },
  { q: "How does the USDX → DAI swap work?", a: "The swap lets you convert USDX holdings into DAI. Swaps may have minimum and maximum amounts, may incur a fee, settle on-chain and cannot be reversed. Review the official swap rules before converting.", category: "Swaps" },
  { q: "What are the USDX ranks?", a: "Ranks form a tiered ladder tied to cumulative staked volume and qualifying activity. Advancing through the ladder unlocks higher reward multipliers and additional benefits once thresholds are met.", category: "Ranks" },
  { q: "Which wallets are supported?", a: "USDX supports standard self-custody Web3 wallets for the relevant network. Always keep your seed phrase private and verify contract addresses before approving transactions.", category: "Wallets" },
  { q: "Can USDX AI give me financial advice?", a: "No. USDX AI is an informational assistant for understanding the ecosystem. It is not financial advice, and it only reports documented USDX information rather than inventing rates or policies.", category: "General" },
];

export default function FAQPage() {
  return (
    <AppShell>
      <div className="max-w-[820px] mx-auto">
        <CmsAnnouncementBanner />

        <Reveal>
          <div className="text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-blue">
              FAQ
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">
              Frequently Asked Questions
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-[13px] text-text-muted">
              Quick answers to the most common questions about USDX. Still unsure? Ask USDX AI.
            </p>
            <Link
              href="/dashboard?tab=ai"
              className="btn-feel mt-4 inline-flex items-center gap-2 rounded-[10px] bg-accent-blue/10 border border-accent-blue/20 px-4 py-2 text-[12px] font-semibold text-accent-blue transition-colors hover:-translate-y-0.5 hover:bg-accent-blue/20"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Ask USDX AI
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 40}>
              <details
                className="group rounded-[14px] border border-border-subtle bg-bg-card transition-colors hover:border-border-medium"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-3.5">
                  <HelpCircle className="h-4 w-4 shrink-0 text-accent-blue" />
                  <span className="flex-1 text-[13px] font-medium text-text-primary">{f.q}</span>
                  <span className="rounded-full border border-border-subtle bg-bg-elevated px-2 py-0.5 text-[10px] text-text-muted">
                    {f.category}
                  </span>
                  <span className="text-text-muted transition-transform group-open:rotate-45 text-[14px]">+</span>
                </summary>
                <div className="border-t border-border-subtle px-5 py-3.5">
                  <p className="text-[13px] leading-relaxed text-text-primary/85">{f.a}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
