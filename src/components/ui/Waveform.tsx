"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface WaveformProps {
  active?: boolean;
  className?: string;
  barCount?: number;
}

function generateDurations(count: number) {
  const durations: number[] = [];
  for (let i = 0; i < count; i++) {
    durations.push(0.6 + ((i * 7 + 3) % 10) / 12.5);
  }
  return durations;
}

export default function Waveform({ active = true, className, barCount = 24 }: WaveformProps) {
  const durations = useMemo(() => generateDurations(barCount), [barCount]);

  return (
    <div className={cn("flex items-center justify-center gap-[3px]", className)}>
      {durations.map((dur, i) => {
        const delay = i * 0.08;
        const maxH = 8 + Math.sin(i * 0.8) * 8;
        return (
          <div
            key={i}
            className={cn(
              "w-[3px] rounded-full transition-all duration-200",
              active
                ? "bg-gradient-to-t from-accent-blue to-accent-cyan"
                : "bg-border-medium"
            )}
            style={
              active
                ? {
                    animation: `waveform ${dur}s ease-in-out ${delay}s infinite alternate`,
                    height: `${maxH}px`,
                  }
                : { height: "3px" }
            }
          />
        );
      })}
    </div>
  );
}
