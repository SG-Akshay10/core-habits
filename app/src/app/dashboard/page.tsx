import { auth } from "@/auth";
import { TopBar } from "@/components/top-bar";
import { TimezoneSync } from "@/components/timezone-sync";
import { HabitList } from "@/components/habit-list";
import { OverviewStatsBar } from "@/components/overview-stats-bar";
import { prisma } from "@/lib/prisma";
import { todayInTimezone } from "@/lib/date";
import { computeOverviewStats } from "@/lib/overview-stats";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { timezone: true, weekStartDay: true },
  });
  const today = todayInTimezone(user?.timezone ?? "UTC");

  const [habits, overview] = await Promise.all([
    prisma.habit.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      include: { logs: { select: { date: true, value: true } } },
    }),
    computeOverviewStats(session.user.id, today),
  ]);

  return (
    <div className="min-h-screen">
      <TimezoneSync />
      <TopBar userName={session.user.name} userImage={session.user.image} />
      <div className="mx-auto w-full max-w-2xl px-6 pt-10">
        <OverviewStatsBar stats={overview} />
      </div>
      <HabitList
        today={today}
        weekStartDay={user?.weekStartDay ?? 0}
        initialHabits={habits.map((h) => ({
          id: h.id,
          name: h.name,
          color: h.color,
          type: h.type,
          goalType: h.goalType,
          goalCount: h.goalCount,
          isNumeric: h.isNumeric,
          targetCount: h.targetCount,
          unitLabel: h.unitLabel,
          logDates: h.logs.map((l) => l.date),
          logValues: Object.fromEntries(
            h.logs.map((l) => [l.date, l.value]),
          ),
        }))}
      />
    </div>
  );

}
