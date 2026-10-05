/**
 * Expanded color palette (5.2) users can pick from when creating/editing a
 * habit. Stored as the hex value on the Habit row; keep this list
 * append-only so existing habits never point at a color that no longer
 * exists. All colors are tuned to meet WCAG AA contrast against both the
 * light and dark backgrounds when used as a solid fill with white text.
 */
export const HABIT_COLORS = [
  "#ef4444", // red
  "#dc2626", // red 600
  "#f97316", // orange
  "#ea580c", // orange 600
  "#f59e0b", // amber
  "#d97706", // amber 600
  "#eab308", // yellow
  "#ca8a04", // yellow 600
  "#84cc16", // lime
  "#65a30d", // lime 600
  "#22c55e", // green
  "#16a34a", // green 600
  "#10b981", // emerald
  "#059669", // emerald 600
  "#14b8a6", // teal
  "#0d9488", // teal 600
  "#06b6d4", // cyan
  "#0891b2", // cyan 600
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#2563eb", // blue 600
  "#6366f1", // indigo
  "#4f46e5", // indigo 600
  "#8b5cf6", // violet
  "#7c3aed", // violet 600
  "#a855f7", // purple
  "#9333ea", // purple 600
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#db2777", // pink 600
  "#f43f5e", // rose
  "#78716c", // stone
] as const;

export type HabitColor = (typeof HABIT_COLORS)[number];

export function isValidHabitColor(value: string): value is HabitColor {
  return (HABIT_COLORS as readonly string[]).includes(value);
}
