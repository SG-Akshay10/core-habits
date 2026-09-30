import { auth } from "@/auth";
import { TopBar } from "@/components/top-bar";
import { TimezoneSync } from "@/components/timezone-sync";
import { HabitList } from "@/components/habit-list";
import { prisma } from "@/lib/prisma";
import { todayInTimezone } from "@/lib/date";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { timezone: true },
  });
  const today = todayInTimezone(user?.timezone ?? "UTC");

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    include: { logs: { select: { date: true } } },
  });

  return (
    <div className="min-h-screen">
      <TimezoneSync />
      <TopBar userName={session.user.name} userImage={session.user.image} />
      <HabitList
        today={today}
        initialHabits={habits.map((h) => ({
          id: h.id,
          name: h.name,
          color: h.color,
          logDates: h.logs.map((l) => l.date),
        }))}
      />
    </div>
  );
}
