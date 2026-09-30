import { Target } from "lucide-react";
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
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        progress.met
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
          : progress.onTrack
            ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"
            : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
      }`}
      title={`${progress.count} of ${goal.goalCount} ${periodLabel}`}
    >
      <Target className="h-3.5 w-3.5" aria-hidden />
      {progress.count} of {goal.goalCount} {periodLabel}
    </span>
  );
}
