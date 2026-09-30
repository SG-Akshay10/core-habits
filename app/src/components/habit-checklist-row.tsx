"use client";

import { habitIconEmoji } from "@/lib/icons";

/**
 * Checklist layout (5.3): a dense, today-focused list — good for scanning
 * and checking off many habits quickly.
 */
export function HabitChecklistRow({
  id,
  name,
  color,
  icon,
  isNumeric,
  targetCount,
  unitLabel,
  logValue,
  isLoggedToday,
  onToggleToday,
  onSetValue,
  onOpen,
}: {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  isNumeric: boolean;
  targetCount: number;
  unitLabel: string | null;
  logValue: number;
  isLoggedToday: boolean;
  onToggleToday: () => void;
  onSetValue: (value: number) => void;
  onOpen: () => void;
}) {
  const done = isNumeric ? logValue >= targetCount : isLoggedToday;
  return (
    <div
      className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2 dark:border-gray-800"
      data-habit-id={id}
    >
      {isNumeric ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onSetValue(Math.max(0, logValue - 1))}
            aria-label={`Decrease ${name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full border text-sm"
            style={{ borderColor: color, color }}
          >
            −
          </button>
          <button
            type="button"
            onClick={() => onSetValue(logValue + 1)}
            aria-label={`Increase ${name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full border text-sm"
            style={{
              backgroundColor: done ? color : "transparent",
              borderColor: color,
              color: done ? "#fff" : color,
            }}
          >
            +
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggleToday}
          aria-pressed={isLoggedToday}
          aria-label={`Mark ${name} done today`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm"
          style={{
            backgroundColor: isLoggedToday ? color : "transparent",
            borderColor: color,
            color: isLoggedToday ? "#fff" : color,
          }}
        >
          {isLoggedToday ? "✓" : ""}
        </button>
      )}

      <button
        type="button"
        onClick={onOpen}
        className={`flex min-w-0 flex-1 items-center gap-2 text-left ${
          done ? "text-gray-400 line-through decoration-gray-300" : ""
        }`}
      >
        {icon && <span aria-hidden>{habitIconEmoji(icon)}</span>}
        <span className="truncate text-sm font-medium">{name}</span>
      </button>

      {isNumeric && (
        <span className="shrink-0 text-xs tabular-nums text-gray-500">
          {logValue}/{targetCount}
          {unitLabel ? ` ${unitLabel}` : ""}
        </span>
      )}
    </div>
  );
}
