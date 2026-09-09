"use client";

import { cn } from "@/lib/utils";

interface AvatarOrbProps {
  size?: "sm" | "md" | "lg" | "xl";
  active?: boolean;
  listening?: boolean;
  className?: string;
}

const sizes = {
  sm: { container: "h-10 w-10", core: "h-6 w-6", ring: "h-10 w-10" },
  md: { container: "h-14 w-14", core: "h-8 w-8", ring: "h-14 w-14" },
  lg: { container: "h-24 w-24", core: "h-14 w-14", ring: "h-24 w-24" },
  xl: { container: "h-36 w-36", core: "h-20 w-20", ring: "h-36 w-36" },
};

export default function AvatarOrb({
  size = "md",
  active = true,
  listening = false,
  className,
}: AvatarOrbProps) {
  const s = sizes[size];
  return (
    <div className={cn("relative flex items-center justify-center", s.container, className)}>
      {/* Ripple rings */}
      {active && (
        <>
          <div
            className={cn(
              "absolute rounded-full border border-accent-blue/20",
              s.ring,
              listening && "animate-[orbRipple_2.5s_ease-out_infinite]"
            )}
          />
          <div
            className={cn(
              "absolute rounded-full border border-accent-cyan/15",
              s.ring,
              listening && "animate-[orbRipple_3s_ease-out_0.5s_infinite]"
            )}
          />
        </>
      )}

      {/* Rotating energy ring */}
      <div
        className={cn(
          "absolute rounded-full",
          s.ring,
          listening
            ? "animate-[energyRing_4s_linear_infinite]"
            : active
              ? "animate-[energyRing_8s_linear_infinite]"
              : "opacity-30"
        )}
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, rgba(59,130,246,0.3) 25%, transparent 50%, rgba(34,211,238,0.2) 75%, transparent 100%)",
        }}
      />

      {/* Core orb */}
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center",
          s.core,
          listening
            ? "bg-gradient-to-br from-accent-blue via-accent-cyan to-accent-blue animate-[orbPulse_1.5s_ease-in-out_infinite]"
            : active
              ? "bg-gradient-to-br from-accent-blue via-accent-cyan/80 to-accent-blue animate-[orbPulse_3s_ease-in-out_infinite]"
              : "bg-gradient-to-br from-[#1a1a24] to-[#252530]"
        )}
        style={
          active
            ? {
                boxShadow: listening
                  ? "0 0 40px rgba(59,130,246,0.5), 0 0 80px rgba(34,211,238,0.3)"
                  : "0 0 24px rgba(59,130,246,0.3), 0 0 60px rgba(59,130,246,0.1)",
              }
            : undefined
        }
      >
        {/* AI icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={cn(
            size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-10 w-10"
          )}
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5z"
            fill="currentColor"
            className="text-white/90"
          />
          <path
            d="M2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/60"
          />
        </svg>
      </div>
    </div>
  );
}
