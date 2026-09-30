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
        className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300"
        title="Current streak"
      >
        🔥 {current} day{current === 1 ? "" : "s"}
      </span>
      <span
        className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        title="Longest streak"
      >
        🏆 {longest} day{longest === 1 ? "" : "s"}
      </span>
    </div>
  );
}
