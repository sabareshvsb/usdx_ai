"use client";

import Image from "next/image";
import { MousePointerClick, Trophy, TrendingDown, TrendingUp } from "lucide-react";
import AnimatedBackground from "@/components/motion/AnimatedBackground";
import CountUp from "@/components/motion/CountUp";
import LiveBadge from "@/components/motion/LiveBadge";
import Reveal from "@/components/motion/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import VerticalTextCarousel from "@/components/motion/VerticalTextCarousel";
import { useDexScreener } from "@/hooks/useDexScreener";
import { TOKEN, formatUsd, formatUsdCompact } from "@/lib/token";

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const TAGLINES = [
  "The DeFi Engine That Pays You to Stay",
  "Trigger Peg Technology",
  "Sustainability",
  "Strong Community",
  "Smart",
  "Future Of Currencies",
];

export default function HeroSection() {
  const { data, loading } = useDexScreener();

  const price = data?.price ?? TOKEN.price;
  const priceChange24h = data?.priceChange24h ?? TOKEN.priceChange24h;
  const volume24h = data?.volume24h ?? TOKEN.volume24h;
  const liquidity = data?.liquidityUsd ?? TOKEN.liquidity;
  const isPositive = priceChange24h >= 0;

  const stats = [
    {
      label: "USDX Price",
      value: price,
      decimals: 4,
      format: (n: number) => formatUsd(n, 4) + " DAI",
    },
    {
      label: "24H Volume",
      value: volume24h,
      decimals: 0,
      format: formatUsdCompact,
    },
    {
      label: "Liquidity",
      value: liquidity,
      decimals: 0,
      format: formatUsdCompact,
    },
    {
      label: "Holders",
      value: TOKEN.holders,
      decimals: 0,
    },
  ];

  return (
    <section
      id="hero"
      className="relative scroll-mt-14 overflow-hidden rounded-2xl border border-border-subtle bg-bg-card"
    >
      <AnimatedBackground variant="hero" />

      <div className="relative z-10 px-6 pb-8 pt-10 sm:px-10 sm:pt-14 lg:px-12">
        <div className="max-w-3xl">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <LiveBadge />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                Live Intelligence · Live Event
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-5xl">
              <TextReveal text={TOKEN.name} duration={3000} />
              <VerticalTextCarousel
                phrases={TAGLINES}
                className="mt-1"
                textClassName="hero-title-accent block text-2xl font-extrabold tracking-tight sm:text-4xl"
              />
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-text-secondary sm:text-[15px]">
              A decentralized stablecoin built for real-world liquidity. Self-managing
              holdings, compounding yields, and on-chain transparency — all driven by
              live intelligence that updates with every block.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => scrollToId("overview")}
                className="btn-feel btn-glow flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-blue to-accent-cyan px-5 py-3 text-[13px] font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <MousePointerClick className="h-4 w-4" />
                Enter Live Overview
              </button>
              <button
                type="button"
                onClick={() => scrollToId("leaders")}
                className="btn-feel flex items-center gap-2 rounded-xl border border-border-medium bg-bg-elevated/70 px-5 py-3 text-[13px] font-semibold text-text-secondary hover:-translate-y-0.5 hover:border-accent-blue/40 hover:text-text-primary"
              >
                <Trophy className="h-4 w-4" />
                View Leaderboard
              </button>
            </div>
          </Reveal>
        </div>

        {/* Animated live stats */}
        <Reveal delay={320}>
          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="card-lift rounded-xl border border-border-subtle bg-bg-elevated/50 px-4 py-3.5"
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                  {s.label}
                </p>
                <p className="mt-1 text-[18px] font-bold tracking-tight text-text-primary sm:text-[20px]">
                  {loading && data === null ? (
                    <span className="skeleton inline-block h-5 w-20 rounded" />
                  ) : (
                    <CountUp
                      value={s.value}
                      decimals={s.decimals}
                      format={s.format}
                    />
                  )}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={400}>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
            <span
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${
                isPositive ? "bg-success/10 text-success" : "bg-error/10 text-error"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              24H {formatUsd(price)} {!isPositive ? "↓" : "↑"} {Math.abs(priceChange24h).toFixed(2)}%
            </span>
            <Image
              src="/usdxcoin.png"
              alt=""
              width={18}
              height={18}
              className="rounded-full opacity-80"
            />
            <span>Market data refreshes automatically every 30 seconds.</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}