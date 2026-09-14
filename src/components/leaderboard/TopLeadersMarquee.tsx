import { Medal, Star } from "lucide-react";

const TOP_LEADERS = [
  "MR.ARJUN",
  "MRS.RASATHI",
  "MR.VENKAT",
  "MRS.SUDHA",
  "MRS.JEEVITHA",
  "MRS.ANITHA",
  "MR.ARJUN KUMAR",
  "MR.ARUNPANDI",
  "MR.BALAMURUHAN",
  "MR.FEROSE",
  "MR.GANDHI",
  "MR.GOKUL",
  "MR.PERUMAL",
  "MR.ILANGOVAN",
  "MR.KADARKARAI",
  "MR.KARTHIK YADAV",
  "MR.KATHIR",
  "MRS.LATHA",
  "MR.LOGANATAN",
  "MR.MADHUSUDHAN",
  "MRS.MEGA",
  "MR.MOHAN",
  "MR.MOHAN RAJ",
  "MR.NATARAJAN",
  "MRS.NISHA",
  "MRS.NITYA",
  "MRS.SIVAGAMI",
  "MR.SEKAR",
  "MRS.PRGATHI",
  "MR.RAMESH",
  "MR.RAMESH KUMAR",
  "MRS.RAMYA",
  "MRS.RITHANYA",
  "MR.SAMPATH",
  "MR.SANJAY",
  "MR.SARAVANAN",
  "MR.SELVA KUMAR",
  "MR.SURESH",
  "MR.VELAN",
  "MRS.VANI",
  "MR.SOLAN",
  "MRS.BHARATHI",
];

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="relative overflow-hidden">
      <div
        className={`marquee-track items-center ${
          reverse ? "marquee-track--reverse" : ""
        }`}
      >
        {[...TOP_LEADERS, ...TOP_LEADERS].map((name, i) => (
          <span
            key={`${reverse}-${i}`}
            className="flex shrink-0 items-center whitespace-nowrap"
          >
            <span className="elite-gold-text font-cinzel text-[13px] font-bold tracking-[0.06em] sm:text-[14px]">
              {name}
            </span>
            <Star
              className="mx-5 h-3 w-3 shrink-0 text-[#e9b44c]"
              fill="currentColor"
            />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0c1220] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0a0f1c] to-transparent" />
    </div>
  );
}

export default function TopLeadersMarquee() {
  return (
    <section id="top-leaders" className="scroll-mt-16">
      <div className="relative overflow-hidden rounded-2xl border border-[#8a6a2f]/30 bg-gradient-to-br from-[#0c1220] via-[#141b2e] to-[#0a0f1c] shadow-[0_20px_60px_-30px_rgba(217,119,6,0.35)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-24 h-56 w-56 rounded-full bg-[#e9b44c]/10 blur-3xl" />
          <div className="absolute -right-16 -bottom-24 h-56 w-56 rounded-full bg-[#e9b44c]/8 blur-3xl" />
          <div className="hero-grid absolute inset-0 opacity-40" />
        </div>

        <div className="relative">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3 px-5 pt-5 sm:px-7">
            <Medal className="h-4 w-4 text-[#e9b44c]" />
            <h2 className="font-cinzel text-[15px] font-bold tracking-wide text-[#f5c26b] sm:text-[17px]">
              TOP LEADERS
            </h2>
          </div>

          {/* Two-row marquee */}
          <div className="pb-5 pt-4">
            <div className="border-y border-[#ffffff]/5 bg-[#0a0f1c]/60 py-3">
              <MarqueeRow />
              <div className="my-3 h-px bg-[#ffffff]/5" />
              <MarqueeRow reverse />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}