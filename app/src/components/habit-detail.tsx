"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HabitGrid } from "@/components/habit-grid";
import { HabitCalendar } from "@/components/habit-calendar";
import { StreakChips } from "@/components/streak-chips";
import { calculateStreak } from "@/lib/streak";

export type LogEntry = { date: string; note: string | null };

export function HabitDetail({
  habitId,
  name,
  color,
  type,
  today,
  initialLogs,
}: {
  habitId: string;
  name: string;
  color: string;
  type: "build" | "quit";
  today: string;
  initialLogs: LogEntry[];
}) {
  const [logs, setLogs] = useState<Map<string, string | null>>(
    () => new Map(initialLogs.map((l) => [l.date, l.note])),
  );
  const [month, setMonth] = useState(() => today.slice(0, 7));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [pendingDates, setPendingDates] = useState<Set<string>>(new Set());

  const logDates = useMemo(() => new Set(logs.keys()), [logs]);
  const streak = useMemo(
    () => calculateStreak([...logDates], today),
    [logDates, today],
  );

  const doneWord = type === "quit" ? "Clean" : "Done";
  const doneWordLower = type === "quit" ? "stayed clean" : "logged";

  async function toggleDate(date: string) {
    if (date > today || pendingDates.has(date)) return;
    const isLogged = logs.has(date);

    setPendingDates((prev) => new Set(prev).add(date));
    setLogs((prev) => {
      const next = new Map(prev);
      if (isLogged) next.delete(date);
      else next.set(date, null);
      return next;
    });
    if (selectedDate === date && isLogged) {
      setSelectedDate(null);
    }

    try {
      const res = await fetch(
        `/api/habits/${habitId}/logs/${encodeURIComponent(date)}`,
        { method: isLogged ? "DELETE" : "PUT" },
      );
      if (!res.ok) throw new Error("failed");
    } catch {
      // Rollback on failure.
      setLogs((prev) => {
        const next = new Map(prev);
        if (isLogged) next.set(date, null);
        else next.delete(date);
        return next;
      });
    } finally {
      setPendingDates((prev) => {
        const next = new Set(prev);
        next.delete(date);
        return next;
      });
    }
  }

  function openNoteEditor(date: string) {
    if (date > today) return;
    setSelectedDate(date);
    setNoteDraft(logs.get(date) ?? "");
  }

  async function saveNote() {
    if (!selectedDate) return;
    setNoteSaving(true);
    const trimmed = noteDraft.trim();
    try {
      const res = await fetch(
        `/api/habits/${habitId}/logs/${encodeURIComponent(selectedDate)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: trimmed || null }),
        },
      );
      if (!res.ok) throw new Error("failed");
      setLogs((prev) => new Map(prev).set(selectedDate, trimmed || null));
    } catch {
      // Leave draft as-is so the user can retry.
    } finally {
      setNoteSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back to habits
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h1 className="text-xl font-semibold">{name}</h1>
          <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-500 dark:border-gray-700">
            {type === "quit" ? "Quitting" : "Building"}
          </span>
        </div>
        <StreakChips current={streak.current} longest={streak.longest} />
      </div>

      <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="mb-3 text-sm font-medium text-gray-500">Full year</h2>
        <HabitGrid
          color={color}
          logDates={logDates}
          today={today}
          onToggleDate={toggleDate}
        />
      </section>

      <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="mb-3 text-sm font-medium text-gray-500">Calendar</h2>
        <HabitCalendar
          color={color}
          logDates={logDates}
          today={today}
          month={month}
          onMonthChange={setMonth}
          onToggleDate={toggleDate}
        />
        <p className="mt-3 text-xs text-gray-400">
          Click a day to toggle whether you {doneWordLower} that day. Future
          days are disabled.
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="mb-3 text-sm font-medium text-gray-500">Note</h2>
        <div className="flex flex-col gap-2">
          <label htmlFor="log-date" className="text-xs text-gray-500">
            Pick a logged day to add or edit a note
          </label>
          <select
            id="log-date"
            value={selectedDate ?? ""}
            onChange={(e) =>
              e.target.value ? openNoteEditor(e.target.value) : setSelectedDate(null)
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">— Select a {doneWord.toLowerCase()} day —</option>
            {[...logs.keys()]
              .sort()
              .reverse()
              .map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
          </select>

          {selectedDate && (
            <div className="flex flex-col gap-2">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                maxLength={280}
                rows={3}
                placeholder="Optional note…"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={saveNote}
                  disabled={noteSaving}
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
                >
                  {noteSaving ? "Saving…" : "Save note"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
