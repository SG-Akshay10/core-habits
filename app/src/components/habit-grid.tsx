"use client";

import { buildGridDates } from "@/lib/date";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

/**
 * Year-long heatmap: 7 rows (days) x ~53 columns (weeks), oldest to newest
 * left-to-right, today at the right edge. Filled tiles use the habit color,
 * with month labels along the top and weekday labels down the left edge
 * (GitHub-contribution-graph style) so the grid is easy to read at a glance.
 *
 * Columns fill the available width (no horizontal scroll) — cells shrink or
 * grow to fit the container, staying square via aspect-ratio.
 */
export function HabitGrid({
  color,
  logDates,
  today,
  onToggleDate,
}: {
  color: string;
  logDates: Set<string>;
  today: string;
  /** When provided, past/today cells become clickable to toggle their log. */
  onToggleDate?: (date: string) => void;
}) {
  const columns = buildGridDates(today, 53);

  // Figure out which columns should carry a month label: the first column
  // whose first day falls in a given month (skip the very first column to
  // avoid a cramped/clipped label at the left edge).
  const monthLabelForColumn = columns.map((column, i) => {
    const month = Number(column[0].slice(5, 7)) - 1;
    const prevMonth =
      i > 0 ? Number(columns[i - 1][0].slice(5, 7)) - 1 : month;
    const isNewMonth = i === 0 || month !== prevMonth;
    return i > 0 && isNewMonth ? MONTH_LABELS[month] : null;
  });

  return (
<<<<<<< HEAD
    <div className="w-full overflow-x-auto">
      <div className="flex gap-[3px]" dir="ltr">
        <div className="grid grid-rows-7 gap-[3px] pt-[18px]">
          {DAY_LABELS.map((label, i) => (
            <span
              key={i}
              className="flex h-full items-center text-[10px] leading-none text-gray-400"
              style={{ minWidth: 20 }}
            >
              {label}
            </span>
          ))}
=======
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
            const clickable = !isFuture && !!onToggleDate;
            return (
              <button
                key={date}
                type="button"
                disabled={!clickable}
                onClick={clickable ? () => onToggleDate!(date) : undefined}
                title={`${date} — ${isLogged ? "logged" : "not logged"}`}
                aria-label={`${date}, ${isFuture ? "future date" : isLogged ? "logged" : "not logged"}`}
                aria-pressed={!isFuture ? isLogged : undefined}
                className={`aspect-square w-full rounded-[2px] motion-reduce:transition-none ${
                  clickable ? "cursor-pointer hover:opacity-80" : ""
                }`}
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
>>>>>>> origin/dev
        </div>

        <div
          className="grid flex-1 gap-[3px]"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(9px, 1fr))`,
          }}
        >
          {columns.map((column, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-[3px]">
              <span className="h-[14px] text-[10px] leading-none whitespace-nowrap text-gray-400">
                {monthLabelForColumn[colIdx]}
              </span>
              <div className="grid grid-rows-7 gap-[3px]">
                {column.map((date) => {
                  const isFuture = date > today;
                  const isLogged = logDates.has(date);
                  const isToday = date === today;
                  const clickable = !isFuture && !!onToggleDate;
                  return (
                    <button
                      key={date}
                      type="button"
                      disabled={!clickable}
                      onClick={clickable ? () => onToggleDate!(date) : undefined}
                      title={`${date} — ${isLogged ? "logged" : "not logged"}`}
                      className={`aspect-square w-full rounded-[3px] ring-inset transition ${
                        isToday ? "ring-2 ring-offset-0" : ""
                      } ${
                        clickable
                          ? "cursor-pointer hover:scale-110 hover:ring-2"
                          : ""
                      }`}
                      style={{
                        backgroundColor: isFuture
                          ? "transparent"
                          : isLogged
                            ? color
                            : "var(--habit-grid-empty, #e5e7eb)",
                        ...(isToday || clickable
                          ? ({ "--tw-ring-color": color } as React.CSSProperties)
                          : {}),
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

