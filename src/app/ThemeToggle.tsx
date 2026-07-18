"use client";

import { useSyncExternalStore } from "react";

const THEME_CHANGE_EVENT = "crm-imperial-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

// El script anti-parpadeo en layout.tsx ya define el tema real antes de que
// React hidrate — este valor solo se usa para el render que matchea el HTML
// del servidor, useSyncExternalStore lo reemplaza por getSnapshot() enseguida.
function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

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
