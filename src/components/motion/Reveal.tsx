"use client";

import { useEffect, useRef, useState, type PropsWithChildren } from "react";

type RevealVariant = "up" | "left" | "right" | "zoom";

const variantClass: Record<RevealVariant, string> = {
  up: "",
  left: "rv--left",
  right: "rv--right",
  zoom: "rv--zoom",
};

interface RevealProps extends PropsWithChildren {
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}

export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
}: RevealProps) {
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
      { threshold: 0.1, rootMargin: "0px 0px -36px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rv ${variantClass[variant]} ${inView ? "is-in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}