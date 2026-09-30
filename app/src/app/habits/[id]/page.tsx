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
    select: { timezone: true },
  });
  const today = todayInTimezone(user?.timezone ?? "UTC");

  const habit = await prisma.habit.findFirst({
    where: { id, userId: session.user.id },
    include: { logs: { select: { date: true, note: true } } },
  });

  if (!habit) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <TopBar userName={session.user.name} userImage={session.user.image} />
      <HabitDetail
        habitId={habit.id}
        name={habit.name}
        color={habit.color}
        type={habit.type}
        today={today}
        initialLogs={habit.logs}
      />
    </div>
  );
}
