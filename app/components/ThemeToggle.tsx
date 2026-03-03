"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      applyTheme(stored);
      return;
    }

    const prefersLight = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches;

    const initial: Theme = prefersLight ? "light" : "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", next);
    }
    applyTheme(next);
  };

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-dim)] px-3 py-1 text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] bg-[var(--bg-surface)]/60 backdrop-blur-sm transition-colors"
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      <span className="relative flex h-4 w-7 items-center rounded-full bg-[var(--accent-dim)]">
        <span
          className={`h-3 w-3 rounded-full bg-[var(--accent)] transition-transform duration-200 ${
            isLight ? "translate-x-3" : "translate-x-1"
          }`}
        />
      </span>
      <span>{isLight ? "Light" : "Dark"}</span>
    </button>
  );
}

