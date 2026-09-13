"use client";

import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently in view
 * (falls back to "" when none of the tracked sections is visible).
 */
export function useScrollSpy(ids: readonly string[], offset = 120): string {
  const [active, setActive] = useState("");

  useEffect(() => {
    if (ids.length === 0) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const pos = window.scrollY + offset;
        let current = "";
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.offsetTop <= pos) current = id;
        }
        setActive(current);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids, offset]);

  return active;
}