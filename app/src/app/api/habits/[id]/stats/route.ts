import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { todayInTimezone } from "@/lib/date";
import { computeHabitStats } from "@/lib/stats";

type Params = { params: Promise<{ id: string }> };

// GET /api/habits/:id/stats — aggregate stats + 12-month chart data for a
// single owned habit. All heavy aggregation happens in the database
// (GROUP BY date-bucketing), not in application code, per PRD guidance.
export async function GET(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`habits:stats:${getClientKey(req)}`, {
    limit: 60,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;

  const [user, habit] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { timezone: true, weekStartDay: true },
    }),
    prisma.habit.findFirst({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        createdAt: true,
        goalType: true,
        goalCount: true,
      },
    }),
  ]);

  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const today = todayInTimezone(user?.timezone ?? "UTC");
  const weekStartDay = user?.weekStartDay ?? 0;

  const stats = await computeHabitStats(
    habit.id,
    habit.createdAt,
    today,
    { goalType: habit.goalType, goalCount: habit.goalCount },
    weekStartDay,
  );

  return NextResponse.json({ stats });
}
