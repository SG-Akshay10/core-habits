"use client";

import { buildGridDates } from "@/lib/date";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

/** Year-long contribution grid with month and weekday labels. */
export function HabitGrid({
  color,
  logDates,
  today,
  onToggleDate,
}: {
  color: string;
  logDates: Set<string>;
  today: string;
  onToggleDate?: (date: string) => void;
}) {
  const columns = buildGridDates(today, 53);
  const monthLabels = columns.map((column, index) => {
    const month = Number(column[0].slice(5, 7)) - 1;
    const previousMonth =
      index > 0 ? Number(columns[index - 1][0].slice(5, 7)) - 1 : month;
    return index > 0 && month !== previousMonth ? MONTH_LABELS[month] : "";
  });

  return (
    <div className="w-full">
      <div className="flex min-w-0 gap-2" dir="ltr">
        <div className="grid shrink-0 grid-rows-7 gap-[3px] pt-[18px]">
          {DAY_LABELS.map((label, index) => (
            <span
              key={index}
              className="flex h-full min-w-6 items-center text-[10px] leading-none text-gray-400"
            >
              {label}
            </span>
          ))}
        </div>

        <div
          className="grid min-w-0 flex-1 gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex min-w-0 flex-col gap-[3px]">
              <span className="h-[14px] whitespace-nowrap text-[10px] leading-none text-gray-400">
                {monthLabels[columnIndex]}
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
                      onClick={clickable ? () => onToggleDate(date) : undefined}
                      title={`${date} — ${isLogged ? "logged" : "not logged"}`}
                      aria-label={`${date}, ${isFuture ? "future date" : isLogged ? "logged" : "not logged"}`}
                      aria-pressed={!isFuture ? isLogged : undefined}
                      className={`aspect-square w-full rounded-[3px] transition motion-reduce:transition-none ${
                        isToday ? "ring-2 ring-inset" : ""
                      } ${clickable ? "cursor-pointer hover:scale-110 hover:ring-2" : ""}`}
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
