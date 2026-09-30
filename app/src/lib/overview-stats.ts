/**
 * Global overview stats across all of a user's habits (4.8 — Could
 * priority). Aggregates in the database rather than pulling every log
 * row into application code, consistent with the per-habit stats approach.
 */
import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/streak";

export type OverviewStats = {
  totalCheckIns: number;
  activeHabits: number;
  bestStreak: number;
  bestStreakHabitName: string | null;
};

/**
 * `activeHabits` = habits with at least one log in the last 7 days.
 * `bestStreak` = the highest current streak across all of the user's habits.
 */
export async function computeOverviewStats(
  userId: string,
  today: string,
): Promise<OverviewStats> {
  const [totalCheckIns, habits] = await Promise.all([
    prisma.habitLog.count({ where: { habit: { userId } } }),
    prisma.habit.findMany({
      where: { userId },
      select: {
        name: true,
        logs: { select: { date: true } },
      },
    }),
  ]);

  const sevenDaysAgo = (() => {
    const [y, m, d] = today.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() - 6);
    return dt.toISOString().slice(0, 10);
  })();

  let activeHabits = 0;
  let bestStreak = 0;
  let bestStreakHabitName: string | null = null;

  for (const habit of habits) {
    const dates = habit.logs.map((l: { date: string }) => l.date);
    if (dates.some((d: string) => d >= sevenDaysAgo && d <= today)) {
      activeHabits++;
    }
    const { current } = calculateStreak(dates, today);
    if (current > bestStreak) {
      bestStreak = current;
      bestStreakHabitName = habit.name;
    }
  }

  return {
    totalCheckIns,
    activeHabits,
    bestStreak,
    bestStreakHabitName,
  };
}
