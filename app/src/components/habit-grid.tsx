"use client";

import { buildGridDates } from "@/lib/date";

/**
 * Year-long heatmap: 7 rows (days) x ~53 columns (weeks), oldest to newest
 * left-to-right, today at the right edge. Filled tiles use the habit color.
 *
 * Columns fill the available width (no horizontal scroll) — cells shrink or
 * grow to fit the container, staying square via aspect-ratio.
 */
export function HabitGrid({
  color,
  logDates,
  today,
}: {
  color: string;
  logDates: Set<string>;
  today: string;
}) {
  const columns = buildGridDates(today, 53);

  return (
    <div
      className="grid w-full gap-[2px]"
      dir="ltr"
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
    >
      {columns.map((column, colIdx) => (
        <div key={colIdx} className="grid grid-rows-7 gap-[2px]">
          {column.map((date) => {
            const isFuture = date > today;
            const isLogged = logDates.has(date);
            return (
              <div
                key={date}
                title={`${date} — ${isLogged ? "logged" : "not logged"}`}
                className="aspect-square w-full rounded-[2px]"
                style={{
                  backgroundColor: isFuture
                    ? "transparent"
                    : isLogged
                      ? color
                      : "var(--habit-grid-empty, #e5e7eb)",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}


