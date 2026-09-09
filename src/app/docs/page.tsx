"use client";

import AppShell from "@/components/layout/AppShell";
import { AlertTriangle, Scale, MessageSquare } from "lucide-react";
import Link from "next/link";

const toc = [
  { id: "overview", label: "Overview" },
  { id: "staking", label: "Staking" },
  { id: "compounding", label: "Compounding" },
  { id: "swaps", label: "Swaps" },
  { id: "ranks", label: "Ranks" },
  { id: "affiliate", label: "Affiliate" },
  { id: "wallets", label: "Wallets" },
  { id: "rules", label: "Project Rules" },
];

const sections = [
  { id: "overview", title: "Overview", body: ["USDX is a stable, yield-bearing digital asset pegged to the US Dollar. It combines a native stablecoin with staking, compounding, swaps, an affiliate program and a tiered rank system designed for long-term, predictable growth.", "The ecosystem is built around holding and staking USDX over time. Rewards are continuously reinforced through an auto-compounding mechanism, while the rank ladder unlocks progressively higher returns as participants grow."] },
  { id: "staking", title: "Staking", body: ["Staking allows participants to lock up USDX and earn yield over a defined period. To stake, connect a supported wallet, acquire USDX and deposit into the staking pool."], bullets: ["Minimum holding period before rewards mature", "Rewards based on staked balance and rank", "Higher ranks earn higher effective yields", "Monitor rewards in the dashboard"] },
  { id: "compounding", title: "Compounding", body: ["Compounding automatically reinvests earned rewards into your staked balance. This drives exponential long-term growth, with the compounding schedule determining how frequently yields accrue."], bullets: ["Rewards calculated on your staked amount", "Rewards re-added to principal automatically", "Longer horizons benefit most from compounding"] },
  { id: "swaps", title: "Swaps", body: ["The USDX → DAI swap converts USDX holdings into DAI. Swaps follow a defined ruleset and settle on-chain."], bullets: ["Minimum / maximum per-transaction amounts apply", "A fee may apply depending on pool conditions", "Completed swaps cannot be reversed", "Supported pair: USDX → DAI"] },
  { id: "ranks", title: "Ranks", body: ["Ranks form a tiered ladder tied to cumulative staked volume and qualifying activity. Advancing through the ladder unlocks higher reward multipliers and additional benefits once thresholds are met."] },
  { id: "affiliate", title: "Affiliate System", body: ["The affiliate program rewards you for referring new participants. Share your referral link, earn commission on qualifying activity, and build a network that supports rank advancement."] },
  { id: "wallets", title: "Wallets", body: ["USDX supports standard self-custody Web3 wallets. Keep your seed phrase private, enable two-factor authentication where available, and verify contract addresses before approving transactions."] },
];

export default function DocsPage() {
  return (
    <AppShell>
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-56 lg:shrink-0">
            <div className="lg:sticky lg:top-24">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-blue">
                Documentation
              </span>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-text-primary">
                USDX Docs
              </h1>
              <nav className="mt-5 space-y-0.5 border-l border-border-subtle pl-3">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block rounded-[6px] px-2 py-1.5 text-[12px] text-text-muted transition-colors hover:text-accent-blue"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <Link
                href="/dashboard?tab=ai"
                className="mt-5 flex items-center gap-2 rounded-[10px] bg-accent-blue/10 border border-accent-blue/20 px-3.5 py-2 text-[12px] font-semibold text-accent-blue transition-colors hover:bg-accent-blue/20"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Ask USDX AI
              </Link>
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-10">
            {sections.map(({ id, title, body, bullets }) => (
              <section key={id} id={id} className="scroll-mt-24">
                <h2 className="text-xl font-bold tracking-tight text-text-primary">{title}</h2>
                {body.map((p, i) => (
                  <p key={i} className="mt-2.5 max-w-2xl text-[13.5px] leading-relaxed text-text-primary/85">{p}</p>
                ))}
                {bullets && (
                  <ul className="mt-3 max-w-2xl space-y-1.5">
                    {bullets.map((b, i) => (
                      <li key={i} className="flex gap-2 text-[13px] text-text-primary/85">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent-blue" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <section id="rules" className="scroll-mt-24 rounded-[14px] border border-accent-amber/20 bg-accent-amber/5 p-5">
              <div className="flex items-center gap-3">
                <Scale className="h-5 w-5 text-accent-amber" />
                <h2 className="text-lg font-bold tracking-tight text-text-primary">Project Rules</h2>
              </div>
              <p className="mt-2.5 max-w-2xl text-[13.5px] leading-relaxed text-text-primary/85">
                All activity within the USDX ecosystem is governed by the official project rules. These define every number on the platform — rates, minimums, lock-up periods, rank thresholds, swap terms and affiliate conditions.
              </p>
              <div className="mt-3 flex items-start gap-3 rounded-[10px] border border-accent-amber/20 bg-accent-amber/8 px-3.5 py-3 max-w-2xl">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent-amber" />
                <div>
                  <p className="text-[12px] font-semibold text-text-primary">Source of truth</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-text-primary/85">
                    The official Project Rules are the authoritative reference for every rate and requirement. USDX AI does not invent or interpret these parameters — it reports what is documented.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
