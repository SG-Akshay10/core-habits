"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { HabitGrid } from "@/components/habit-grid";
import { StreakChips } from "@/components/streak-chips";
import { GoalChip } from "@/components/goal-chip";
import { calculateStreak } from "@/lib/streak";
import { calculateWeekStreak } from "@/lib/goals";
import { getHabitIcon } from "@/lib/icons";

export function HabitCard({
  id,
  name,
  color,
  icon,
  type,
  goalType,
  goalCount,
  isNumeric,
  targetCount,
  unitLabel,
  logDates,
  logValue,
  today,
  weekStartDay,
  isLoggedToday,
  canMoveUp = false,
  canMoveDown = false,
  draggable = false,
  onToggleToday,
  onSetValue,
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  type: "build" | "quit";
  goalType: "daily" | "weekly" | "monthly";
  goalCount: number;
  isNumeric: boolean;
  targetCount: number;
  unitLabel: string | null;
  logDates: Set<string>;
  logValue: number;
  today: string;
  weekStartDay: number;
  isLoggedToday: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  draggable?: boolean;
  onToggleToday: () => void;
  onSetValue: (value: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const goal = { goalType, goalCount };
  const streak =
    goalType === "weekly"
      ? calculateWeekStreak(goal, [...logDates], today, weekStartDay)
      : calculateStreak([...logDates], today);
  const doneLabel = type === "quit" ? "Clean today" : "Log today";
  const undoLabel =
    type === "quit" ? "Undo today's clean day" : "Undo today's log";
  const Icon = getHabitIcon(icon);

  return (
    <div
      className="card-surface rounded-2xl p-4 shadow-sm transition hover:shadow-md"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          {draggable && (
            <span
              className="cursor-grab select-none text-gray-400"
              aria-hidden
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </span>
          )}
          {(onMoveUp || onMoveDown) && (
            <div className="flex flex-col">
              <button
                type="button"
                aria-label={`Move ${name} up`}
                disabled={!canMoveUp}
                onClick={onMoveUp}
                className="leading-none text-gray-400 hover:text-gray-700 disabled:opacity-20 dark:hover:text-gray-200"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Move ${name} down`}
                disabled={!canMoveDown}
                onClick={onMoveDown}
                className="leading-none text-gray-400 hover:text-gray-700 disabled:opacity-20 dark:hover:text-gray-200"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <Link
            href={`/habits/${id}`}
            className="flex min-w-0 items-center gap-2.5 hover:opacity-80"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm"
              style={{ backgroundColor: `${color}22`, color }}
              aria-hidden
            >
              {Icon ? (
                <Icon className="h-4.5 w-4.5" strokeWidth={2.25} />
              ) : (
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
            </span>
            <h3 className="truncate font-semibold">{name}</h3>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isNumeric ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSetValue(Math.max(0, logValue - 1))}
                aria-label="Decrease"
                className="flex h-8 w-8 items-center justify-center rounded-full border-2"
                style={{ borderColor: color, color }}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span
                className="min-w-[3rem] text-center text-sm font-semibold tabular-nums"
                title={`${logValue} of ${targetCount}${unitLabel ? ` ${unitLabel}` : ""}`}
              >
                {logValue}/{targetCount}
              </span>
              <button
                type="button"
                onClick={() => onSetValue(logValue + 1)}
                aria-label="Increase"
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-sm"
                style={{
                  backgroundColor: logValue >= targetCount ? color : "transparent",
                  borderColor: color,
                  color: logValue >= targetCount ? "#fff" : color,
                }}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggleToday}
              aria-pressed={isLoggedToday}
              title={isLoggedToday ? undoLabel : doneLabel}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm transition active:scale-95"
              style={{
                backgroundColor: isLoggedToday ? color : "transparent",
                borderColor: color,
                color: isLoggedToday ? "#fff" : color,
              }}
            >
              {isLoggedToday && <Check className="h-5 w-5" strokeWidth={3} />}
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Habit options"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MoreVertical className="h-4.5 w-4.5" />
            </button>
            {menuOpen && (
              <div
                className="card-surface absolute right-0 z-10 mt-1 w-32 rounded-xl py-1 text-sm shadow-lg"
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
                {onDuplicate && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDuplicate();
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Duplicate
                  </button>
                )}
                {onArchive && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onArchive();
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Archive
                  </button>
                )}
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

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StreakChips current={streak.current} longest={streak.longest} />
        <GoalChip
          goal={goal}
          logDates={[...logDates]}
          today={today}
          weekStartDay={weekStartDay}
        />
      </div>

      <HabitGrid color={color} logDates={logDates} today={today} />
    </div>
  );
}

