"use client";

/**
 * Monthly calendar view with prev/next navigation. Complements the
 * full-year grid on the habit detail page — same click-to-toggle behavior,
 * but with day-of-week labels and easier "which Tuesday was that" scanning.
 */
export function HabitCalendar({
  color,
  logDates,
  today,
  month, // "YYYY-MM"
  onMonthChange,
  onToggleDate,
}: {
  color: string;
  logDates: Set<string>;
  today: string;
  month: string;
  onMonthChange: (month: string) => void;
  onToggleDate: (date: string) => void;
}) {
  const [year, monthNum] = month.split("-").map(Number);
  const firstOfMonth = new Date(Date.UTC(year, monthNum - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
  const leadingBlanks = firstOfMonth.getUTCDay(); // 0 = Sunday

  const cells: (string | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = String(i + 1).padStart(2, "0");
      const m = String(monthNum).padStart(2, "0");
      return `${year}-${m}-${d}`;
    }),
  ];

  const [todayYear, todayMonth] = today.split("-").map(Number);
  const isCurrentMonth = todayYear === year && todayMonth === monthNum;

  function shiftMonth(delta: number) {
    const d = new Date(Date.UTC(year, monthNum - 1 + delta, 1));
    onMonthChange(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(firstOfMonth);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          ‹
        </button>
        <span className="text-sm font-medium">{monthLabel}</span>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={isCurrentMonth}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;
          const isFuture = date > today;
          const isLogged = logDates.has(date);
          const dayNum = Number(date.slice(-2));
          return (
            <button
              key={date}
              type="button"
              disabled={isFuture}
              onClick={() => onToggleDate(date)}
              title={date}
              className={`flex aspect-square items-center justify-center rounded-md text-sm transition ${
                isFuture ? "text-gray-300 dark:text-gray-700" : "cursor-pointer hover:opacity-80"
              } ${date === today ? "ring-2 ring-gray-400" : ""}`}
              style={{
                backgroundColor: isLogged ? color : "transparent",
                color: isLogged ? "#fff" : undefined,
              }}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}
