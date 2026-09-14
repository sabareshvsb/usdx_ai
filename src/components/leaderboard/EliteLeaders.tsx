"use client";

import { useEffect, useRef, useState } from "react";
import { Crown, Gem, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const ELITE_LEADERS = [
  "MR.DINESH",
  "MR.ARUL SABARISH",
  "MR.HARIHARAN",
  "MR.MOHAN",
  "MR.MUTHU KUMAR",
  "MR.SAHUL HAMEED",
  "MR.YUVARAJ",
  "MR.SOUNDAR",
  "MR.MAHESH",
  "MR.NAVEEN",
  "MR.BOOPATHI",
  "MR.SALEEM",
  "MR.MANIKANDA PARBU",
  "MR.ARJUN",
  "MR.SELVA",
  "MR.HARIPRASAD",
  "MR.GUNA",
  "MR.JHONSON",
];

export default function EliteLeaders() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      void Promise.resolve().then(() => setInView(true));
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="elite-leaders" className="scroll-mt-16">
      <div
        ref={ref}
        className="relative overflow-hidden rounded-2xl border border-[#8a6a2f]/30 bg-gradient-to-br from-[#0c1220] via-[#141b2e] to-[#0a0f1c] shadow-[0_20px_60px_-30px_rgba(217,119,6,0.35)]"
      >
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-[#e9b44c]/10 blur-3xl" />
          <div className="absolute -right-16 -bottom-24 h-64 w-64 rounded-full bg-[#e9b44c]/8 blur-3xl" />
          <div className="hero-grid absolute inset-0 opacity-40" />
        </div>

        <div
          className={cn(
            "relative px-5 py-7 sm:px-7 sm:py-8",
            inView && "animate-fade-in"
          )}
        >
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <Crown className="h-5 w-5 text-[#e9b44c]" />
                <h2 className="font-cinzel text-[19px] font-bold tracking-wide text-[#f5c26b] sm:text-[22px]">
                  ELITE LEADERS
                </h2>
              </div>
              <p className="mt-1.5 text-[12px] text-[#8fa0c4]">
                Distinguished leading members of the USDX ecosystem
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-[#e9b44c]/40 bg-[#e9b44c]/10 px-3 py-1 text-[11px] font-semibold text-[#f5c26b]">
              <Gem className="h-3.5 w-3.5" />
              {ELITE_LEADERS.length} Elites
            </span>
          </div>

          {/* Divider */}
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-[#e9b44c]/40 to-transparent" />

          {/* Names grid */}
          <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {ELITE_LEADERS.map((name, i) => (
              <div
                key={name}
                className={cn(
                  "group flex items-center gap-2.5 rounded-[10px] border border-[#ffffff]/5 bg-[#ffffff]/[0.03] px-3.5 py-2.5 transition-all duration-300 hover:border-[#e9b44c]/40 hover:bg-[#e9b44c]/8",
                  "elite-name",
                  inView && "is-in"
                )}
                style={{ animationDelay: `${i * 95}ms` }}
              >
                <Star
                  className="h-3 w-3 shrink-0 text-[#e9b44c]"
                  fill="currentColor"
                />
                <span className="elite-gold-text font-cinzel text-[13px] font-bold tracking-[0.08em] sm:text-[14px]">
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-6 flex items-center gap-2 text-[11px] text-[#8fa0c4]/80">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e9b44c] elite-glow" />
            Honoring the visionaries behind USDX
          </div>
        </div>
      </div>
    </section>
  );
}