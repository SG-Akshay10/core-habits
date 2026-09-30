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
    select: { timezone: true, weekStartDay: true, theme: true, defaultView: true },
  });
  const today = todayInTimezone(user?.timezone ?? "UTC");

  const [habits, archivedHabits, overview] = await Promise.all([
    prisma.habit.findMany({
      where: { userId: session.user.id, archivedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { logs: { select: { date: true, value: true } } },
    }),
    prisma.habit.findMany({
      where: { userId: session.user.id, archivedAt: { not: null } },
      orderBy: { archivedAt: "desc" },
      include: { logs: { select: { date: true, value: true } } },
    }),
    computeOverviewStats(session.user.id, today),
  ]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TimezoneSync />
      <TopBar
        userName={session.user.name}
        userImage={session.user.image}
        theme={(user?.theme as "light" | "dark" | "system") ?? "system"}
      />
      <div className="mx-auto w-full max-w-6xl px-6 pt-8">
        <OverviewStatsBar stats={overview} />
      </div>
      <HabitList
        today={today}
        weekStartDay={user?.weekStartDay ?? 0}
        initialView={
          (user?.defaultView as "cards" | "checklist" | "compact") ?? "cards"
        }
        initialHabits={habits.map((h) => ({
          id: h.id,
          name: h.name,
          color: h.color,
          icon: h.icon,
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
        initialArchivedHabits={archivedHabits.map((h) => ({
          id: h.id,
          name: h.name,
          color: h.color,
          icon: h.icon,
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
