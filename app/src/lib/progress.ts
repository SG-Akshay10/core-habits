/**
 * Aggregated data for the global Progress/analytics page: an average daily
 * completion score, a Mon–Sun "weekly rhythm" of check-ins across all
 * habits, and a per-habit summary table (streak, completion rate, totals).
 * Mirrors the per-habit stats in `lib/stats.ts` but rolled up across a
 * user's whole habit list.
 */
import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/streak";

export type WeeklyRhythmDay = { day: number; count: number };

export type HabitProgressSummary = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  isNumeric: boolean;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // 0..1, since the habit was created
  totalCompletions: number;
};

export type ProgressData = {
  averageDailyScore: number; // 0..1, averaged over the last 7 days
  weeklyRhythm: WeeklyRhythmDay[]; // index 0 = Sunday .. 6 = Saturday
  missedCount: number; // habits not completed today
  habits: HabitProgressSummary[];
};

function daysBeforeInclusive(endDate: string, count: number): string[] {
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

export async function computeProgressData(
  userId: string,
  today: string,
): Promise<ProgressData> {
  const habits = await prisma.habit.findMany({
    where: { userId, archivedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      color: true,
      icon: true,
      isNumeric: true,
      targetCount: true,
      createdAt: true,
      logs: { select: { date: true, value: true } },
    },
  });

  const last7 = daysBeforeInclusive(today, 7);
  const last7Set = new Set(last7);

  // Per-day completion counts across all habits, for the weekly rhythm
  // chart and the average daily score.
  const perDayCount = new Map<string, number>();
  for (const date of last7) perDayCount.set(date, 0);

  const habitsSummary: HabitProgressSummary[] = habits.map((h: (typeof habits)[number]) => {
    const dates = h.logs.map((l: { date: string; value: number }) => l.date);
    const dateSet = new Set(dates);
    const streak = calculateStreak(dates, today);

    for (const date of last7) {
      if (!dateSet.has(date)) continue;
      if (h.isNumeric) {
        const value =
          h.logs.find((l: { date: string; value: number }) => l.date === date)
            ?.value ?? 0;
        if (value < h.targetCount) continue;
      }
      perDayCount.set(date, (perDayCount.get(date) ?? 0) + 1);
    }

    const createdDate = h.createdAt.toISOString().slice(0, 10);
    const daysSinceCreated = Math.max(
      1,
      Math.round(
        (Date.UTC(...(today.split("-").map(Number) as [number, number, number])) -
          Date.UTC(
            ...(createdDate.split("-").map(Number) as [number, number, number]),
          )) /
          86_400_000,
      ) + 1,
    );

    return {
      id: h.id,
      name: h.name,
      color: h.color,
      icon: h.icon,
      isNumeric: h.isNumeric,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      completionRate: Math.min(1, dates.length / daysSinceCreated),
      totalCompletions: dates.length,
    };
  });

  const totalHabits = habits.length || 1;
  const weeklyRhythm: WeeklyRhythmDay[] = last7.map((date) => {
    const [y, m, d] = date.split("-").map(Number);
    return {
      day: new Date(Date.UTC(y, m - 1, d)).getUTCDay(),
      count: perDayCount.get(date) ?? 0,
    };
  });

  const averageDailyScore =
    last7.reduce((sum, date) => sum + (perDayCount.get(date) ?? 0) / totalHabits, 0) /
    last7.length;

  const doneToday = habits.filter((h: (typeof habits)[number]) => {
    const todayLog = h.logs.find(
      (l: { date: string; value: number }) => l.date === today,
    );
    if (!todayLog) return false;
    return h.isNumeric ? (todayLog.value ?? 0) >= h.targetCount : true;
  }).length;

  void last7Set; // retained for clarity of intent; not otherwise read

  return {
    averageDailyScore,
    weeklyRhythm,
    missedCount: habits.length - doneToday,
    habits: habitsSummary,
  };
}
