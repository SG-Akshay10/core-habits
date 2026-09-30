"use client";

import { useMemo, useState } from "react";
import { HABIT_COLORS } from "@/lib/colors";
import { HABIT_ICONS, getHabitIcon } from "@/lib/icons";

export function HabitForm({
  initialName = "",
  initialColor = HABIT_COLORS[0],
  initialIcon = null,
  initialType = "build",
  initialGoalType = "daily",
  initialGoalCount = 1,
  initialIsNumeric = false,
  initialTargetCount = 1,
  initialUnitLabel = "",
  submitLabel = "Add habit",
  pending = false,
  showType = false,
  onSubmit,
  onCancel,
}: {
  initialName?: string;
  initialColor?: string;
  initialIcon?: string | null;
  initialType?: "build" | "quit";
  initialGoalType?: "daily" | "weekly" | "monthly";
  initialGoalCount?: number;
  initialIsNumeric?: boolean;
  initialTargetCount?: number;
  initialUnitLabel?: string;
  submitLabel?: string;
  pending?: boolean;
  /** Show the build/quit selector — only meaningful on creation. */
  showType?: boolean;
  onSubmit: (values: {
    name: string;
    color: string;
    icon: string | null;
    type: "build" | "quit";
    goalType: "daily" | "weekly" | "monthly";
    goalCount: number;
    isNumeric: boolean;
    targetCount: number;
    unitLabel: string;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [icon, setIcon] = useState<string | null>(initialIcon);
  const [iconQuery, setIconQuery] = useState("");
  const [type, setType] = useState<"build" | "quit">(initialType);
  const [goalType, setGoalType] = useState<"daily" | "weekly" | "monthly">(
    initialGoalType,
  );
  const [goalCount, setGoalCount] = useState(initialGoalCount);
  const [isNumeric, setIsNumeric] = useState(initialIsNumeric);
  const [targetCount, setTargetCount] = useState(initialTargetCount);
  const [unitLabel, setUnitLabel] = useState(initialUnitLabel);
  const [error, setError] = useState<string | null>(null);

  const filteredIcons = useMemo(() => {
    const q = iconQuery.trim().toLowerCase();
    if (!q) return HABIT_ICONS;
    return HABIT_ICONS.filter(
      (i) => i.name.includes(q) || i.keywords.some((k) => k.includes(q)),
    );
  }, [iconQuery]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    if (trimmed.length > 60) {
      setError("Name must be 60 characters or fewer");
      return;
    }
    if (goalType !== "daily" && (!Number.isInteger(goalCount) || goalCount < 1)) {
      setError("Goal must be at least 1");
      return;
    }
    if (isNumeric && (!Number.isInteger(targetCount) || targetCount < 1)) {
      setError("Target must be at least 1");
      return;
    }
    setError(null);
    onSubmit({
      name: trimmed,
      color,
      icon,
      type,
      goalType,
      goalCount,
      isNumeric,
      targetCount,
      unitLabel: unitLabel.trim(),
    });
  }


  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {showType && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Type</span>
          <div className="flex gap-2">
            <button
              type="button"
              aria-pressed={type === "build"}
              onClick={() => setType("build")}
              className={`flex-1 rounded-md border px-3 py-2 text-sm ${
                type === "build"
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            >
              Build a habit
            </button>
            <button
              type="button"
              aria-pressed={type === "quit"}
              onClick={() => setType("quit")}
              className={`flex-1 rounded-md border px-3 py-2 text-sm ${
                type === "quit"
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            >
              Quit a habit
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="habit-name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="habit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          autoFocus
          placeholder={
            type === "quit" ? "e.g. No smoking" : "e.g. Read 10 pages"
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Icon</span>
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-300 dark:border-gray-700"
            style={{ color }}
            aria-hidden
          >
            {(() => {
              const PreviewIcon = getHabitIcon(icon);
              return PreviewIcon ? (
                <PreviewIcon className="h-4.5 w-4.5" />
              ) : (
                <span className="text-gray-400">—</span>
              );
            })()}
          </span>
          <input
            type="text"
            value={iconQuery}
            onChange={(e) => setIconQuery(e.target.value)}
            placeholder="Search icons…"
            aria-label="Search icons"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
          />
          {icon && (
            <button
              type="button"
              onClick={() => setIcon(null)}
              className="shrink-0 rounded-md px-2 py-2 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Clear
            </button>
          )}
        </div>
        <div className="icon-picker-scroll mt-1 grid max-h-36 grid-cols-7 gap-1 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/70 p-2 sm:grid-cols-9 dark:border-gray-800 dark:bg-gray-950/50">
          {filteredIcons.map((i) => (
            <button
              key={i.name}
              type="button"
              aria-label={i.name.replaceAll("-", " ")}
              title={i.name.replaceAll("-", " ")}
              aria-pressed={icon === i.name}
              onClick={() => setIcon(i.name)}
              className={`flex aspect-square w-full items-center justify-center rounded-lg transition ${
                icon === i.name
                  ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <i.icon className="h-4.5 w-4.5" />
            </button>
          ))}
          {filteredIcons.length === 0 && (
            <span className="p-1 text-xs text-gray-500">No icons found</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Color</span>
        <div className="flex flex-wrap gap-2">
          {HABIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
              className="h-8 w-8 rounded-full ring-offset-2 transition"
              style={{
                backgroundColor: c,
                outline: color === c ? "2px solid currentColor" : "none",
                outlineOffset: 2,
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Goal</span>
        <div className="flex gap-2">
          {(["daily", "weekly", "monthly"] as const).map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={goalType === g}
              onClick={() => setGoalType(g)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize ${
                goalType === g
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        {goalType !== "daily" && (
          <div className="mt-2 flex items-center gap-2">
            <label htmlFor="goal-count" className="text-sm text-gray-500">
              Times per {goalType === "weekly" ? "week" : "month"}
            </label>
            <input
              id="goal-count"
              type="number"
              min={1}
              max={31}
              value={goalCount}
              onChange={(e) => setGoalCount(Number(e.target.value))}
              className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={isNumeric}
            onChange={(e) => setIsNumeric(e.target.checked)}
            className="h-4 w-4"
          />
          Track a number instead of a checkmark
        </label>
        {isNumeric && (
          <div className="mt-2 flex items-center gap-2">
            <label htmlFor="target-count" className="text-sm text-gray-500">
              Target per day
            </label>
            <input
              id="target-count"
              type="number"
              min={1}
              max={1000}
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
            <input
              type="text"
              placeholder="unit (e.g. glasses)"
              maxLength={20}
              value={unitLabel}
              onChange={(e) => setUnitLabel(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
