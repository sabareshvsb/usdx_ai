"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  size?: number;
}

export function LogoMark({ className, size = 32 }: LogoMarkProps) {
  return (
    <Image
      src="/usdxcoin.png"
      alt="USDX"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full logo-glow", className)}
      aria-hidden="true"
    />
  );
}

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  compact?: boolean;
}

export default function Logo({ className, showWordmark = true, compact = false }: LogoProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <LogoMark size={28} />
      </div>
    );
  }
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWordmark && (
        <span className="text-[15px] font-bold leading-none tracking-tight text-glow-animate">
          <span className="text-text-primary">USDX</span>
          <span className="animated-gradient-text ml-0.5"> AI</span>
        </span>
      )}
    </div>
  );
}
