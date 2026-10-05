/** Aggregated data for the global analytics page. */
import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/streak";

export type WeeklyRhythmDay = { day: number; count: number; rate: number };
export type MonthlyVolume = {
  month: string;
  label: string;
  total: number;
  byHabit: { id: string; name: string; color: string; count: number }[];
};

export type AnalyticsHabitSummary = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  isNumeric: boolean;
  goalType: string;
  goalCount: number;
  unitLabel: string | null;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
  totalOutput: number;
  recentCompletions: number;
};

export type AnalyticsData = {
  year: string;
  averageDailyScore: number;
  weeklyRhythm: WeeklyRhythmDay[];
  monthlyVolume: MonthlyVolume[];
  activeHabits: number;
  totalDaysLogged: number;
  totalCheckIns: number;
  habits: AnalyticsHabitSummary[];
};

function dateOffset(endDate: string, offset: number): string {
  const [y, m, d] = endDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function monthOffset(today: string, offset: number) {
  const [year, month] = today.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  const key = date.toISOString().slice(0, 7);
  return {
    key,
    label: date.toLocaleDateString("en", { month: "short", timeZone: "UTC" }).toUpperCase(),
  };
}

export async function computeAnalyticsData(
  userId: string,
  today: string,
): Promise<AnalyticsData> {
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
      unitLabel: true,
      goalType: true,
      goalCount: true,
      createdAt: true,
      logs: { select: { date: true, value: true } },
    },
  });

  const recentStart = dateOffset(today, -89);
  const recentDates = Array.from({ length: 90 }, (_, i) => dateOffset(recentStart, i));
  const recentCounts = new Map(recentDates.map((date) => [date, 0]));
  const currentYear = today.slice(0, 4);
  const months = Array.from({ length: 12 }, (_, i) => monthOffset(today, i - 11));
  const monthlyVolume: MonthlyVolume[] = months.map(({ key, label }) => ({
    month: key,
    label,
    total: 0,
    byHabit: habits.map((habit) => ({ id: habit.id, name: habit.name, color: habit.color, count: 0 })),
  }));
  const yearDates = new Set<string>();

  const habitsSummary: AnalyticsHabitSummary[] = habits.map((habit) => {
    const completedLogs = habit.logs.filter((log) =>
      !habit.isNumeric || log.value >= habit.targetCount,
    );
    const dates = completedLogs.map((log) => log.date);
    const streak = calculateStreak(dates, today);

    for (const log of completedLogs) {
      if (recentCounts.has(log.date)) {
        recentCounts.set(log.date, (recentCounts.get(log.date) ?? 0) + 1);
      }
      if (log.date.startsWith(currentYear)) yearDates.add(log.date);
      const month = monthlyVolume.find((item) => item.month === log.date.slice(0, 7));
      if (month) {
        month.total++;
        const channel = month.byHabit.find((item) => item.id === habit.id);
        if (channel) channel.count++;
      }
    }

    const createdDate = habit.createdAt.toISOString().slice(0, 10);
    const daysSinceCreated = Math.max(
      1,
      Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${createdDate}T00:00:00Z`)) / 86_400_000) + 1,
    );
    const totalOutput = habit.isNumeric
      ? habit.logs.reduce((sum, log) => sum + log.value, 0)
      : dates.length;

    return {
      id: habit.id,
      name: habit.name,
      color: habit.color,
      icon: habit.icon,
      isNumeric: habit.isNumeric,
      goalType: habit.goalType,
      goalCount: habit.goalCount,
      unitLabel: habit.unitLabel,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      completionRate: Math.min(1, dates.length / daysSinceCreated),
      totalCompletions: dates.length,
      totalOutput,
      recentCompletions: dates.filter((date) => date >= recentStart && date <= today).length,
    };
  });

  const weekdays = Array.from({ length: 7 }, (_, day) => {
    const dates = recentDates.filter((date) => new Date(`${date}T00:00:00Z`).getUTCDay() === day);
    const completions = dates.reduce((sum, date) => sum + (recentCounts.get(date) ?? 0), 0);
    const possible = dates.reduce(
      (sum, date) => sum + habits.filter((habit) => habit.createdAt.toISOString().slice(0, 10) <= date).length,
      0,
    );
    return { day, count: completions, rate: possible ? completions / possible : 0 };
  });

  const opportunities = recentDates.reduce(
    (sum, date) => sum + habits.filter((habit) => habit.createdAt.toISOString().slice(0, 10) <= date).length,
    0,
  );
  const recentCompletions = [...recentCounts.values()].reduce((sum, count) => sum + count, 0);
  return {
    year: currentYear,
    averageDailyScore: opportunities ? recentCompletions / opportunities : 0,
    weeklyRhythm: weekdays,
    monthlyVolume,
    activeHabits: habitsSummary.filter((habit) => habit.recentCompletions > 0).length,
    totalDaysLogged: yearDates.size,
    totalCheckIns: habitsSummary.reduce((sum, habit) => sum + habit.totalCompletions, 0),
    habits: habitsSummary,
  };
}
