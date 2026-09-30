"use client";

import Link from "next/link";
import { CalendarRange, Flame, Percent, CircleSlash2 } from "lucide-react";
import { getHabitIcon } from "@/lib/icons";
import type { ProgressData } from "@/lib/progress";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

/** Weekly rhythm bar chart: check-ins per weekday over the last 7 days. */
function WeeklyRhythmChart({ data }: { data: ProgressData["weeklyRhythm"] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex h-28 items-end gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex h-20 w-full items-end">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-indigo-400 to-blue-500 transition-all"
              style={{
                height: `${Math.max((d.count / max) * 100, d.count > 0 ? 8 : 2)}%`,
                opacity: d.count > 0 ? 1 : 0.15,
              }}
              title={`${d.count} check-in${d.count === 1 ? "" : "s"}`}
            />
          </div>
          <span className="text-[11px] font-medium text-gray-400">
            {DAY_LABELS[d.day]}
          </span>
        </div>
      ))}
    </div>
  );
}

function ScoreCard({
  Icon,
  label,
  value,
  accent,
}: {
  Icon: typeof Percent;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="card-surface flex flex-col items-center gap-1 rounded-2xl p-4 text-center shadow-sm">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-white shadow-sm`}
        aria-hidden
      >
        <Icon className="h-4.5 w-4.5" strokeWidth={2.5} />
      </span>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

export function ProgressView({ data }: { data: ProgressData }) {
  const averagePct = Math.round(data.averageDailyScore * 100);
  const bestHabit = [...data.habits].sort(
    (a, b) => b.currentStreak - a.currentStreak,
  )[0];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:underline"
        >
          Back to habits
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ScoreCard
          Icon={Percent}
          label="Avg. daily score (7d)"
          value={`${averagePct}%`}
          accent="from-emerald-400 to-teal-500"
        />
        <ScoreCard
          Icon={Flame}
          label="Best current streak"
          value={bestHabit ? bestHabit.currentStreak : 0}
          accent="from-orange-400 to-rose-500"
        />
        <ScoreCard
          Icon={CalendarRange}
          label="Habits tracked"
          value={data.habits.length}
          accent="from-indigo-400 to-blue-500"
        />
        <ScoreCard
          Icon={CircleSlash2}
          label="Missed today"
          value={data.missedCount}
          accent="from-gray-400 to-gray-500"
        />
      </div>

      <div className="card-surface rounded-2xl p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-500">
          Weekly rhythm
        </h2>
        <WeeklyRhythmChart data={data.weeklyRhythm} />
      </div>

      <div className="card-surface overflow-hidden rounded-2xl shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--surface-border)] text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Habit</th>
              <th className="px-4 py-3 font-medium">Current streak</th>
              <th className="px-4 py-3 font-medium">Best streak</th>
              <th className="px-4 py-3 font-medium">Completion rate</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.habits.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-400" colSpan={5}>
                  No habits yet — add one to see your progress here.
                </td>
              </tr>
            )}
            {data.habits.map((h) => {
              const Icon = getHabitIcon(h.icon);
              return (
                <tr
                  key={h.id}
                  className="border-b border-[var(--surface-border)] last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/habits/${h.id}`}
                      className="flex items-center gap-2 font-medium hover:underline"
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${h.color}22`, color: h.color }}
                        aria-hidden
                      >
                        {Icon ? (
                          <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                        ) : (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: h.color }}
                          />
                        )}
                      </span>
                      {h.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{h.currentStreak}d</td>
                  <td className="px-4 py-3 tabular-nums">{h.longestStreak}d</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.round(h.completionRate * 100)}%`,
                            backgroundColor: h.color,
                          }}
                        />
                      </div>
                      <span className="tabular-nums text-gray-500">
                        {Math.round(h.completionRate * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{h.totalCompletions}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
