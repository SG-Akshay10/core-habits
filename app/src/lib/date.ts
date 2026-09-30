/**
 * Local calendar-date helpers. Habit logs are stored as plain `YYYY-MM-DD`
 * strings (no timezone), so "today" must be computed in the user's IANA
 * timezone rather than from a UTC timestamp to avoid off-by-one-day bugs.
 */

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value: string): boolean {
  if (!DATE_FORMAT.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Returns today's date as `YYYY-MM-DD` in the given IANA timezone. */
export function todayInTimezone(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    // en-CA formats as YYYY-MM-DD.
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Builds the list of `YYYY-MM-DD` dates for a year-long grid, oldest first,
 * ending on `endDate` (inclusive). `weeks` columns of 7 days each, aligned
 * so `endDate` lands on the final column.
 */
export function buildGridDates(endDate: string, weeks = 53): string[][] {
  const [y, m, d] = endDate.split("-").map(Number);
  const end = new Date(Date.UTC(y, m - 1, d));
  // Align the end date to the end of its week (Saturday) so columns are full weeks.
  const endDayOfWeek = end.getUTCDay(); // 0 = Sunday
  const daysUntilWeekEnd = 6 - endDayOfWeek;
  const gridEnd = new Date(end);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + daysUntilWeekEnd);

  const totalDays = weeks * 7;
  const columns: string[][] = [];
  for (let w = 0; w < weeks; w++) {
    const column: string[] = [];
    for (let day = 0; day < 7; day++) {
      const offsetFromStart = w * 7 + day;
      const daysFromEnd = totalDays - 1 - offsetFromStart;
      const cellDate = new Date(gridEnd);
      cellDate.setUTCDate(cellDate.getUTCDate() - daysFromEnd);
      column.push(cellDate.toISOString().slice(0, 10));
    }
    columns.push(column);
  }
  return columns;
}

/** Returns the last `count` dates (oldest first), ending on `endDate` inclusive. */
export function lastNDays(endDate: string, count: number): string[] {
  const [y, m, d] = endDate.split("-").map(Number);
  const end = new Date(Date.UTC(y, m - 1, d));
  const dates: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const dt = new Date(end);
    dt.setUTCDate(dt.getUTCDate() - i);
    dates.push(dt.toISOString().slice(0, 10));
  }
  return dates;
}
