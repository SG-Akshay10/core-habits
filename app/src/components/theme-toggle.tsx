"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import type { Theme } from "@/lib/theme";
import { applyTheme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

/**
 * Light/dark toggle. Applying the theme is an instant, local
 * DOM class change — no page reload — and persisting the choice is a
 * single small, debounced-by-nature write (only on click), not on every
 * render.
 */
export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  function handleChange(next: Theme) {
    setTheme(next);
    applyTheme(next);
    fetch("/api/user/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: next }),
    }).catch(() => {});
  }

  return (
    <div className="flex items-center gap-1 border border-gray-200 p-0.5 dark:border-gray-700">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-label={`${opt.label} theme`}
          aria-pressed={theme === opt.value}
          onClick={() => handleChange(opt.value)}
          className={`flex h-7 w-7 items-center justify-center ${
            theme === opt.value
              ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <opt.Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
