import { CheckCircle2, ListChecks, Flame } from "lucide-react";
import type { OverviewStats } from "@/lib/overview-stats";

/** Global overview card shown above the habit list (4.8, Could priority). */
export function OverviewStatsBar({ stats }: { stats: OverviewStats }) {
  const items = [
    { Icon: CheckCircle2, value: stats.totalCheckIns, label: "Total check-ins", accent: "from-emerald-400 to-teal-500" },
    { Icon: ListChecks, value: stats.activeHabits, label: "Active habits", accent: "from-indigo-400 to-blue-500" },
    {
      Icon: Flame,
      value: stats.bestStreak,
      label: "Best streak",
      accent: "from-orange-400 to-rose-500",
      title: stats.bestStreakHabitName ?? undefined,
    },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          title={item.title}
          className="card-surface flex flex-col items-center gap-1 rounded-2xl p-4 text-center shadow-sm"
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${item.accent} text-white shadow-sm`}
            aria-hidden
          >
            <item.Icon className="h-4.5 w-4.5" strokeWidth={2.5} />
          </span>
          <p className="text-xl font-bold tabular-nums">{item.value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
