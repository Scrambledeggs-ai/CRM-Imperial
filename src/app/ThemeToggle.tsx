"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  }

  if (isDark === null) return <div className="w-8 h-8" />;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema"
      className="w-8 h-8 flex items-center justify-center rounded-full border border-panel-border text-sm shrink-0"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
