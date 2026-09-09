"use client";

import { useMemo } from "react";

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  candles: Candle[];
  className?: string;
}

const GAP = 0.22;
const SPACE = 1 - GAP;

export default function CandlestickChart({ candles, className }: CandlestickChartProps) {
  const data = useMemo(() => [...candles].slice(-60), [candles]);

  const { min, max } = useMemo(() => {
    let mn = Infinity;
    let mx = -Infinity;
    for (const c of data) {
      if (c.low < mn) mn = c.low;
      if (c.high > mx) mx = c.high;
    }
    const pad = (mx - mn) * 0.08 || mx * 0.01 || 0.01;
    return { min: mn - pad, max: mx + pad };
  }, [data]);

  const step = 10;
  const gridLines = useMemo(() => {
    const lines: number[] = [];
    for (let i = 0; i <= step; i++) {
      lines.push(min + ((max - min) / step) * i);
    }
    return lines;
  }, [min, max, step]);

  if (data.length === 0) return null;

  const n = data.length;
  const slot = 100 / n;
  const bodyWidth = slot * SPACE;
  const halfBody = bodyWidth / 2;

  return (
    <div className={className}>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="candleBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((v, i) => {
          const y = 40 - ((v - min) / (max - min)) * 40;
          return (
            <line
              key={i}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="var(--grid-line)"
              strokeWidth="0.15"
            />
          );
        })}

        {data.map((c, i) => {
          const x = i * slot + slot / 2;
          const yOpen = 40 - ((c.open - min) / (max - min)) * 40;
          const yClose = 40 - ((c.close - min) / (max - min)) * 40;
          const yHigh = 40 - ((c.high - min) / (max - min)) * 40;
          const yLow = 40 - ((c.low - min) / (max - min)) * 40;

          const up = c.close >= c.open;
          const color = up ? "#34d399" : "#f87171";
          const bodyTop = Math.min(yOpen, yClose);
          const bodyBottom = Math.max(yOpen, yClose);
          const bodyHeight = Math.max(bodyBottom - bodyTop, 0.6);

          return (
            <g key={i}>
              <line
                x1={x}
                x2={x}
                y1={yHigh}
                y2={yLow}
                stroke={color}
                strokeWidth="0.18"
                opacity="0.9"
              />
              <rect
                x={x - halfBody}
                y={bodyTop}
                width={bodyWidth}
                height={bodyHeight}
                fill={up ? "#34d399" : "#f87171"}
                rx="0.15"
                opacity="0.95"
              />
            </g>
          );
        })}

        <rect
          x="0"
          y="38.6"
          width="100"
          height="1.4"
          fill="url(#candleBg)"
          rx="0.7"
        />
      </svg>
    </div>
  );
}
