"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

function getInitialTheme(): "dark" | "light" {
  if (typeof window !== "undefined") {
    return localStorage.getItem("usdx-theme") === "light" ? "light" : "dark";
  }
  return "dark";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
    localStorage.setItem("usdx-theme", next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-[10px] text-text-muted transition-colors",
        "hover:bg-bg-elevated hover:text-text-secondary"
      )}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
