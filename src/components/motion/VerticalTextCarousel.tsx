"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import TextReveal from "./TextReveal";

interface VerticalTextCarouselProps {
  phrases: string[];
  interval?: number;
  className?: string;
  textClassName?: string;
  reveal?: number;
}

/**
 * Auto-advancing vertical text carousel. Slides roll upward on a smooth
 * cubic-bezier curve. Pauses entirely when the user prefers reduced motion.
 * When `reveal` is set, each phrase types itself in (in ms) as it becomes active.
 */
export default function VerticalTextCarousel({
  phrases,
  interval = 3000,
  className = "",
  textClassName = "",
  reveal,
}: VerticalTextCarouselProps) {
  const [index, setIndex] = useState(0);
  const [height, setHeight] = useState(0);
  const [animate, setAnimate] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  const reduceMotion =
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const slides = [...phrases, phrases[0] ?? ""];

  // Measure the tallest slide once, and re-measure if text wraps on resize.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !phrases.length) return;
    const update = () => {
      const children = Array.from(track.children) as HTMLElement[];
      if (!children.length) return;
      setHeight(Math.max(...children.map((c) => c.getBoundingClientRect().height)));
    };
    void Promise.resolve().then(update);
    if (typeof window === "undefined" || !("ResizeObserver" in window)) return;
    const ro = new ResizeObserver(update);
    for (const child of track.children) {
      if (child instanceof HTMLElement) ro.observe(child);
    }
    return () => ro.disconnect();
  }, [phrases]);

  // Advance to the next slide.
  useEffect(() => {
    if (reduceMotion) return;
    const t = setInterval(() => {
      setIndex((i) => (i >= phrases.length ? 0 : i + 1));
    }, interval);
    return () => clearInterval(t);
  }, [phrases.length, interval, reduceMotion]);

  // After the duplicated first slide, snap back to the real first one.
  useEffect(() => {
    if (index < phrases.length) return;
    const t = setTimeout(() => {
      setAnimate(false);
      setIndex(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    }, 560);
    return () => clearTimeout(t);
  }, [index, phrases.length]);

  if (!phrases.length) return null;

  return (
    <div
      className={cn("overflow-hidden", !height && "opacity-0", className)}
      style={height ? { height: `${height}px` } : undefined}
    >
      <div
        ref={trackRef}
        className="flex flex-col will-change-transform"
        style={{
          transform: `translateY(${-index * height}px)`,
          transition: animate ? "transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
        }}
      >
        {slides.map((phrase, i) => {
          const isActive = i === index && (reveal ?? 0) > 0;
          return (
            <div
              key={`${phrase}-${i}`}
              className={textClassName}
              aria-hidden={i === phrases.length}
            >
              {isActive ? (
                <TextReveal
                  key={`reveal-${index}`}
                  text={phrase}
                  duration={reveal}
                />
              ) : (
                phrase
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}