import { calculateGoalProgress, type Goal } from "@/lib/goals";

/**
 * Small progress chip shown on the habit card / detail header, e.g.
 * "2 of 3 this week". Daily-goal habits show nothing (the streak chips
 * already cover that case).
 */
export function GoalChip({
  goal,
  logDates,
  today,
  weekStartDay,
}: {
  goal: Goal;
  logDates: readonly string[];
  today: string;
  weekStartDay: number;
}) {
  if (goal.goalType === "daily") return null;

  const progress = calculateGoalProgress(goal, logDates, today, weekStartDay);
  const periodLabel = goal.goalType === "weekly" ? "this week" : "this month";

  return (
    <span
      className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
        progress.met
          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
          : progress.onTrack
            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      }`}
      title={`${progress.count} of ${goal.goalCount} ${periodLabel}`}
    >
      🎯 {progress.count} of {goal.goalCount} {periodLabel}
    </span>
  );
}
