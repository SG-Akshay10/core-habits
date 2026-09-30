"use client";

import { useState } from "react";
import { HABIT_COLORS } from "@/lib/colors";

export function HabitForm({
  initialName = "",
  initialColor = HABIT_COLORS[0],
  initialType = "build",
  submitLabel = "Add habit",
  pending = false,
  showType = false,
  onSubmit,
  onCancel,
}: {
  initialName?: string;
  initialColor?: string;
  initialType?: "build" | "quit";
  submitLabel?: string;
  pending?: boolean;
  /** Show the build/quit selector — only meaningful on creation. */
  showType?: boolean;
  onSubmit: (values: {
    name: string;
    color: string;
    type: "build" | "quit";
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [type, setType] = useState<"build" | "quit">(initialType);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    onSubmit({ name: trimmed, color, type });
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
