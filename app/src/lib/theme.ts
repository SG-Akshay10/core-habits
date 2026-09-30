export const THEME_COOKIE = "theme";
export type Theme = "light" | "dark" | "system";

export function isValidTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

/**
 * Applies a theme choice to the current document: toggles the `.dark`
 * class (no page reload) and persists the choice in a (non-httpOnly)
 * cookie so the server-rendered root layout can pick the right class on
 * the next full page load without a flash.
 *
 * Deliberately a plain top-level function (not defined inside a component
 * or hook) so it can freely mutate `document`.
 */
export function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

