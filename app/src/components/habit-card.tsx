"use client";

import { useState } from "react";
import Link from "next/link";
import { HabitGrid } from "@/components/habit-grid";
import { StreakChips } from "@/components/streak-chips";
import { calculateStreak } from "@/lib/streak";

export function HabitCard({
  id,
  name,
  color,
  type,
  logDates,
  today,
  isLoggedToday,
  onToggleToday,
  onEdit,
  onDelete,
}: {
  id: string;
  name: string;
  color: string;
  type: "build" | "quit";
  logDates: Set<string>;
  today: string;
  isLoggedToday: boolean;
  onToggleToday: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const streak = calculateStreak([...logDates], today);
  const doneLabel = type === "quit" ? "Clean today" : "Log today";
  const undoLabel =
    type === "quit" ? "Undo today's clean day" : "Undo today's log";

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link
          href={`/habits/${id}`}
          className="flex min-w-0 items-center gap-2 hover:underline"
        >
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="truncate font-medium">{name}</h3>
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onToggleToday}
            aria-pressed={isLoggedToday}
            title={isLoggedToday ? undoLabel : doneLabel}
            className="flex h-9 w-9 items-center justify-center rounded-full border text-lg transition"
            style={{
              backgroundColor: isLoggedToday ? color : "transparent",
              borderColor: color,
              color: isLoggedToday ? "#fff" : color,
            }}
          >
            {isLoggedToday ? "✓" : "+"}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Habit options"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ⋮
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 z-10 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                  className="block w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="block w-full px-3 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <StreakChips current={streak.current} longest={streak.longest} />
      </div>

      <HabitGrid color={color} logDates={logDates} today={today} />
    </div>
  );
}

