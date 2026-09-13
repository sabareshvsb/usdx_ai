"use client";

import { useEffect, useState } from "react";

interface TextRevealProps {
  text: string;
  duration?: number;
  className?: string;
}

/**
 * Types the text in character-by-character over `duration` ms.
 * Jumps straight to the full text when the user prefers reduced motion.
 */
export default function TextReveal({
  text,
  duration = 3000,
  className = "",
}: TextRevealProps) {
  const reduceMotion =
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const [revealed, setRevealed] = useState(() =>
    reduceMotion ? text.length : 0
  );

  useEffect(() => {
    if (reduceMotion) {
      void Promise.resolve().then(() => setRevealed(text.length));
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setRevealed(Math.floor(t * text.length));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setRevealed(text.length);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration, reduceMotion]);

  return (
    <span className={className} aria-label={text}>
      {text.slice(0, revealed)}
    </span>
  );
}