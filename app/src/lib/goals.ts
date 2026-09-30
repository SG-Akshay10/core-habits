/**
 * Goal calculations (see .prd/week-4-goals-and-statistics.md).
 *
 * Habits can have a `daily` (default), `weekly`, or `monthly` goal with a
 * target count. All logic here works on plain `YYYY-MM-DD` strings compared
 * as calendar dates — consistent with `streak.ts` and `date.ts`.
 */

export type GoalType = "daily" | "weekly" | "monthly";

export type Goal = {
  goalType: GoalType;
  goalCount: number;
};

/** Returns the calendar date `days` days after (or before, if negative) `date`. */
function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** 0 = Sunday .. 6 = Saturday, for a `YYYY-MM-DD` date (UTC-based, no tz math). */
function dayOfWeek(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/**
 * Returns the `YYYY-MM-DD` start-of-week date containing `date`, given a
 * configurable week start day (0 = Sunday, 1 = Monday, ...).
 */
export function getWeekStart(date: string, weekStartDay: number): string {
  const dow = dayOfWeek(date);
  const diff = (dow - weekStartDay + 7) % 7;
  return addDays(date, -diff);
}

/** Returns the inclusive [start, end] `YYYY-MM-DD` range for the week containing `date`. */
export function getWeekRange(
  date: string,
  weekStartDay: number,
): [string, string] {
  const start = getWeekStart(date, weekStartDay);
  return [start, addDays(start, 6)];
}

/** Returns the inclusive [start, end] `YYYY-MM-DD` range for the month containing `date`. */
export function getMonthRange(date: string): [string, string] {
  const [y, m] = date.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return [start, end];
}

function countInRange(
  logDates: ReadonlySet<string>,
  start: string,
  end: string,
): number {
  let count = 0;
  for (const date of logDates) {
    if (date >= start && date <= end) count++;
  }
  return count;
}

export type GoalProgress = {
  goalType: GoalType;
  goalCount: number;
  count: number;
  periodStart: string;
  periodEnd: string;
  onTrack: boolean;
  met: boolean;
};

/**
 * Computes progress toward a habit's goal for the period (week/month)
 * containing `today`. For `daily` goals, the period is just `today` itself.
 */
export function calculateGoalProgress(
  goal: Goal,
  logDates: readonly string[],
  today: string,
  weekStartDay: number,
): GoalProgress {
  const dates = new Set(logDates);

  let periodStart: string;
  let periodEnd: string;
  if (goal.goalType === "weekly") {
    [periodStart, periodEnd] = getWeekRange(today, weekStartDay);
  } else if (goal.goalType === "monthly") {
    [periodStart, periodEnd] = getMonthRange(today);
  } else {
    periodStart = today;
    periodEnd = today;
  }

  const count = countInRange(dates, periodStart, periodEnd);
  const met = count >= goal.goalCount;

  // "On track" = met already, or still mathematically possible to meet by
  // period end given the days remaining (including today).
  const daysRemaining =
    (Date.UTC(
      ...(periodEnd.split("-").map(Number) as [number, number, number]),
    ) -
      Date.UTC(...(today.split("-").map(Number) as [number, number, number]))) /
      86_400_000 +
    1;
  const onTrack = met || count + Math.max(daysRemaining, 0) >= goal.goalCount;

  return {
    goalType: goal.goalType,
    goalCount: goal.goalCount,
    count,
    periodStart,
    periodEnd,
    onTrack,
    met,
  };
}

export type WeekStreakResult = {
  current: number;
  longest: number;
};

/**
 * Goal-aware "week streak" for weekly-goal habits: consecutive weeks (from
 * the configured week start day) where the goal count was met. The current,
 * still-in-progress week counts toward the current streak only once its
 * goal has already been met; an unmet-but-still-possible current week
 * doesn't break the streak (it's simply not counted yet).
 */
export function calculateWeekStreak(
  goal: Goal,
  logDates: readonly string[],
  today: string,
  weekStartDay: number,
): WeekStreakResult {
  const dates = new Set(logDates);
  if (dates.size === 0) return { current: 0, longest: 0 };

  const sorted = [...dates].sort();
  const firstDate = sorted[0];

  // Build the count-per-week map from the first logged date's week through
  // the current week.
  const weekCounts = new Map<string, number>();
  let cursorWeekStart = getWeekStart(firstDate, weekStartDay);
  const currentWeekStart = getWeekStart(today, weekStartDay);
  while (cursorWeekStart <= currentWeekStart) {
    const [start, end] = [cursorWeekStart, addDays(cursorWeekStart, 6)];
    weekCounts.set(cursorWeekStart, countInRange(dates, start, end));
    cursorWeekStart = addDays(cursorWeekStart, 7);
  }

  const weekStarts = [...weekCounts.keys()].sort();

  // Longest streak: scan every week in order, counting consecutive weeks
  // meeting the goal (current, possibly-incomplete week included if met).
  let longest = 0;
  let run = 0;
  for (const ws of weekStarts) {
    if ((weekCounts.get(ws) ?? 0) >= goal.goalCount) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  // Current streak: walk backward from the most recent *complete* week
  // (or the current week if it has already met its goal), stopping at the
  // first week that didn't meet the goal.
  let current = 0;
  let idx = weekStarts.length - 1;
  const currentMet = (weekCounts.get(currentWeekStart) ?? 0) >= goal.goalCount;
  if (!currentMet) {
    idx--; // skip the incomplete/unmet current week; it doesn't break the streak.
  }
  for (; idx >= 0; idx--) {
    const ws = weekStarts[idx];
    if ((weekCounts.get(ws) ?? 0) >= goal.goalCount) {
      current++;
    } else {
      break;
    }
  }

  return { current, longest };
}
