import type { OverviewStats } from "@/lib/overview-stats";

/** Global overview card shown above the habit list (4.8, Could priority). */
export function OverviewStatsBar({ stats }: { stats: OverviewStats }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-lg border border-gray-200 p-3 text-center dark:border-gray-800">
        <p className="text-lg font-semibold">{stats.totalCheckIns}</p>
        <p className="text-xs text-gray-500">Total check-ins</p>
      </div>
      <div className="rounded-lg border border-gray-200 p-3 text-center dark:border-gray-800">
        <p className="text-lg font-semibold">{stats.activeHabits}</p>
        <p className="text-xs text-gray-500">Active habits</p>
      </div>
      <div
        className="rounded-lg border border-gray-200 p-3 text-center dark:border-gray-800"
        title={
          stats.bestStreakHabitName
            ? `${stats.bestStreakHabitName}`
            : undefined
        }
      >
        <p className="text-lg font-semibold">{stats.bestStreak}</p>
        <p className="text-xs text-gray-500">Best streak</p>
      </div>
    </div>
  );
}
