export const THEME_COOKIE = "theme";
export type Theme = "light" | "dark";

export function isValidTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark";
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
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
}
