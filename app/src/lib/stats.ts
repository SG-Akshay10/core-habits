/**
 * Stats aggregation for a single habit's detail page (see
 * .prd/week-4-goals-and-statistics.md). Queries aggregate in the database
 * (`GROUP BY`) rather than pulling every log row into application code, so
 * this stays cheap even with years of history.
 */
import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/streak";
import { calculateWeekStreak, type Goal } from "@/lib/goals";

export type MonthlyCount = { month: string; count: number };
export type DayOfWeekCount = { day: number; count: number };

export type HabitStats = {
  totalCompletions: number;
  completionRate: number; // 0..1, since the habit was created
  currentStreak: number;
  longestStreak: number;
  bestMonth: MonthlyCount | null;
  monthly: MonthlyCount[]; // last 12 months, oldest first
  dayOfWeek: DayOfWeekCount[]; // index 0 = Sunday .. 6 = Saturday
};

/**
 * Computes stats for a habit using database-side date-bucketing for the
 * expensive aggregates (monthly chart, day-of-week breakdown, total count),
 * and only pulls the (small) set of distinct logged dates into memory for
 * streak calculations.
 */
export async function computeHabitStats(
  habitId: string,
  createdAt: Date,
  today: string,
  goal: Goal,
  weekStartDay: number,
): Promise<HabitStats> {
  const [totalResult, monthlyRows, dowRows, logDateRows] = await Promise.all([
    prisma.habitLog.count({ where: { habitId } }),
    prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT substring(date, 1, 7) AS month, count(*) AS count
      FROM habit_logs
      WHERE habit_id = ${habitId}
      GROUP BY substring(date, 1, 7)
      ORDER BY month DESC
      LIMIT 12
    `,
    prisma.$queryRaw<{ dow: number; count: bigint }[]>`
      SELECT extract(dow FROM date::date)::int AS dow, count(*) AS count
      FROM habit_logs
      WHERE habit_id = ${habitId}
      GROUP BY dow
    `,
    prisma.habitLog.findMany({
      where: { habitId },
      select: { date: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const logDates = logDateRows.map((r: { date: string }) => r.date);
  const streak = calculateStreak(logDates, today);
  const weekStreak =
    goal.goalType === "weekly"
      ? calculateWeekStreak(goal, logDates, today, weekStartDay)
      : null;

  const monthly: MonthlyCount[] = monthlyRows
    .map((r: { month: string; count: bigint }) => ({
      month: r.month,
      count: Number(r.count),
    }))
    .sort((a: MonthlyCount, b: MonthlyCount) => a.month.localeCompare(b.month));

  const bestMonth = monthly.reduce<MonthlyCount | null>(
    (best, m) => (!best || m.count > best.count ? m : best),
    null,
  );

  const dayOfWeek: DayOfWeekCount[] = Array.from({ length: 7 }, (_, day) => {
    const row = dowRows.find((r: { dow: number; count: bigint }) => r.dow === day);
    return { day, count: row ? Number(row.count) : 0 };
  });

  const createdDate = createdAt.toISOString().slice(0, 10);
  const daysSinceCreated =
    Math.max(
      1,
      Math.round(
        (Date.UTC(
          ...(today.split("-").map(Number) as [number, number, number]),
        ) -
          Date.UTC(
            ...(createdDate.split("-").map(Number) as [number, number, number]),
          )) /
          86_400_000,
      ) + 1,
    );

  return {
    totalCompletions: totalResult,
    completionRate: Math.min(1, totalResult / daysSinceCreated),
    currentStreak: weekStreak ? weekStreak.current : streak.current,
    longestStreak: weekStreak ? weekStreak.longest : streak.longest,
    bestMonth,
    monthly,
    dayOfWeek,
  };
}
