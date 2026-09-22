"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

type Theme = "light" | "dark";

const STORAGE_KEY = "chart-parser-theme";

/*
 * localStorage can throw (Safari private mode, blocked
 * storage), so every access is guarded.
 */
function getStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function saveTheme(theme: Theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage unavailable, theme still works for this visit
  }
}

/*
 * Saved choice first, otherwise the system preference.
 * Read lazily in useState, guarded for the server.
 */
function readTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return (
    getStoredTheme() ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light")
  );
}

/*
 * false on the server and during hydration, true after.
 * Keeps theme dependent output out of the server HTML.
 */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

const NEUTRAL_LABEL = "Toggle theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  const isClient = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  /*
   * Sync React state to the DOM only. Saving happens on
   * click, so an untouched visitor keeps following the OS.
   */
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  }, [theme]);

  const next: Theme = theme === "dark" ? "light" : "dark";

  function toggleTheme() {
    saveTheme(next);
    setTheme(next);
  }

  const label = isClient ? `Switch to ${next} mode` : NEUTRAL_LABEL;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="border-line text-ink-muted hover:bg-sunken hover:text-ink focus-visible:outline-accent flex h-9 w-9 items-center justify-center rounded-lg border transition focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {!isClient ? (
        <span className="h-5 w-5" />
      ) : theme === "dark" ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
}
