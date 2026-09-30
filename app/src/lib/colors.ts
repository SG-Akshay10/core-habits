/**
 * Fixed 12-color palette users can pick from when creating/editing a habit.
 * Stored as the hex value on the Habit row; keep this list append-only so
 * existing habits never point at a color that no longer exists.
 */
export const HABIT_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
] as const;

export type HabitColor = (typeof HABIT_COLORS)[number];

export function isValidHabitColor(value: string): value is HabitColor {
  return (HABIT_COLORS as readonly string[]).includes(value);
}
