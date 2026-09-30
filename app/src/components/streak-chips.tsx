import { Flame, Trophy } from "lucide-react";

export function StreakChips({
  current,
  longest,
}: {
  current: number;
  longest: number;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-300"
        title="Current streak"
      >
        <Flame className="h-3.5 w-3.5" aria-hidden />
        {current} day{current === 1 ? "" : "s"}
      </span>
      <span
        className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300"
        title="Longest streak"
      >
        <Trophy className="h-3.5 w-3.5" aria-hidden />
        {longest} day{longest === 1 ? "" : "s"}
      </span>
    </div>
  );
}
