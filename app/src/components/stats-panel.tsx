"use client";

import { useEffect, useState } from "react";
import { MonthlyChart } from "@/components/monthly-chart";
import type { HabitStats } from "@/lib/stats";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Fetches and renders the stats panel + monthly chart for a habit. */
export function StatsPanel({
  habitId,
  color,
}: {
  habitId: string;
  color: string;
}) {
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/habits/${habitId}/stats`)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setStats(data.stats);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [habitId]);

  if (error) {
    return (
      <p className="text-sm text-gray-400">Couldn&apos;t load stats.</p>
    );
  }

  if (!stats) {
    return <p className="text-sm text-gray-400">Loading stats…</p>;
  }

  const maxDow = Math.max(1, ...stats.dayOfWeek.map((d) => d.count));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total completions" value={stats.totalCompletions} />
        <Stat
          label="Completion rate"
          value={`${Math.round(stats.completionRate * 100)}%`}
        />
        <Stat label="Current streak" value={stats.currentStreak} />
        <Stat label="Best streak" value={stats.longestStreak} />
      </div>

      {stats.bestMonth && (
        <p className="text-sm text-gray-500">
          Best month:{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {stats.bestMonth.month} ({stats.bestMonth.count})
          </span>
        </p>
      )}

      <div>
        <h3 className="mb-2 text-xs font-medium text-gray-500">
          Completions per month
        </h3>
        <MonthlyChart data={stats.monthly} color={color} />
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium text-gray-500">
          Day-of-week breakdown
        </h3>
        <div className="flex items-end gap-2">
          {stats.dayOfWeek.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-16 w-full items-end">
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${Math.max((d.count / maxDow) * 100, d.count > 0 ? 6 : 0)}%`,
                    backgroundColor: color,
                    opacity: d.count > 0 ? 1 : 0.15,
                  }}
                  title={`${DAY_LABELS[d.day]}: ${d.count}`}
                />
              </div>
              <span className="text-[10px] text-gray-400">
                {DAY_LABELS[d.day]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-gray-200 p-3 dark:border-gray-800">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
