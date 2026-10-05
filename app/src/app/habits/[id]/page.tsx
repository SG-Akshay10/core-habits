import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { todayInTimezone } from "@/lib/date";
import { TopBar } from "@/components/top-bar";
import { HabitDetail } from "@/components/habit-detail";

type Params = { params: Promise<{ id: string }> };

export default async function HabitDetailPage({ params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { timezone: true, weekStartDay: true, theme: true },
  });
  const today = todayInTimezone(user?.timezone ?? "UTC");

  const habit = await prisma.habit.findFirst({
    where: { id, userId: session.user.id },
    include: { logs: { select: { date: true, note: true, value: true } } },
  });

  if (!habit) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <TopBar
        userName={session.user.name}
        userImage={session.user.image}
        theme={user?.theme === "dark" ? "dark" : "light"}
      />
      <HabitDetail
        habitId={habit.id}
        name={habit.name}
        color={habit.color}
        icon={habit.icon}
        type={habit.type}
        goalType={habit.goalType}
        goalCount={habit.goalCount}
        isNumeric={habit.isNumeric}
        targetCount={habit.targetCount}
        unitLabel={habit.unitLabel}
        today={today}
        weekStartDay={user?.weekStartDay ?? 0}
        initialLogs={habit.logs}
      />
    </div>
  );
}
