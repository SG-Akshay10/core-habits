/**
 * Streak calculation (v1 rules — see .prd/week-3-history-streaks-quit-habits.md):
 *
 * - A streak is consecutive calendar days with a log.
 * - If today is unlogged, the streak still counts through yesterday and is
 *   shown as "active" (an unlogged today does not break the streak until the
 *   day ends).
 * - Applies identically to `build` habits (log = did it) and `quit` habits
 *   (log = stayed clean) — the caller decides what a "log" means.
 *
 * All dates are plain `YYYY-MM-DD` strings compared as calendar dates (no
 * timezone math here) — the caller is responsible for computing `today` in
 * the user's timezone via `todayInTimezone`. This keeps streaks correct
 * across DST transitions and user timezone changes: only the *set of logged
 * calendar dates* and *today's calendar date string* matter, never wall-clock
 * offsets.
 */

/** Returns the `YYYY-MM-DD` string for the calendar day before `date`. */
function previousDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

export type StreakResult = {
  current: number;
  longest: number;
};

/**
 * Computes current and longest streaks from a set of logged dates.
 *
 * `current` walks backward from `today`: if today is logged, count from
 * today; if today is unlogged, count from yesterday (still "active"); if
 * yesterday is also unlogged, the current streak is 0.
 *
 * `longest` scans every logged date and measures each run of consecutive
 * days, independent of whether it's still active.
 */
export function calculateStreak(
  logDates: readonly string[],
  today: string,
): StreakResult {
  const dates = new Set(logDates);

  // --- current streak ---
  let current = 0;
  let cursor = dates.has(today) ? today : previousDay(today);
  if (dates.has(cursor)) {
    while (dates.has(cursor)) {
      current++;
      cursor = previousDay(cursor);
    }
  }

  // --- longest streak ---
  const sorted = [...dates].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const date of sorted) {
    if (prev !== null && previousDay(date) === prev) {
      run++;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = date;
  }

  return { current, longest };
}
