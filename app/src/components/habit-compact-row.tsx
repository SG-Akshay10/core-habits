"use client";

import { Check } from "lucide-react";
import { lastNDays } from "@/lib/date";
import { getHabitIcon } from "@/lib/icons";

/**
 * Compact layout (5.3): last ~5 days per habit, for scanning many habits at
 * once without the full year heatmap.
 */
export function HabitCompactRow({
  name,
  color,
  icon,
  logDates,
  today,
  isLoggedToday,
  onToggleToday,
}: {
  name: string;
  color: string;
  icon: string | null;
  logDates: Set<string>;
  today: string;
  isLoggedToday: boolean;
  onToggleToday: () => void;
}) {
  const days = lastNDays(today, 5);
  const Icon = getHabitIcon(icon);

  return (
    <div className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2 dark:border-gray-800">
      <button
        type="button"
        onClick={onToggleToday}
        aria-pressed={isLoggedToday}
        aria-label={`Mark ${name} done today`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
        style={{
          backgroundColor: isLoggedToday ? color : "transparent",
          borderColor: color,
          color: isLoggedToday ? "#fff" : color,
        }}
      >
        {isLoggedToday && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {Icon && (
          <Icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
        )}
        <span className="truncate text-sm font-medium">{name}</span>
      </div>

      <div className="flex shrink-0 gap-1">
        {days.map((date) => (
          <span
            key={date}
            title={date}
            className="h-4 w-4 rounded-[2px]"
            style={{
              backgroundColor: logDates.has(date)
                ? color
                : "var(--habit-grid-empty, #e5e7eb)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
