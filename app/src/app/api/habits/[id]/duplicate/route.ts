import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

// POST /api/habits/:id/duplicate — copies a habit's settings (not its log
// history) into a new habit, placed at the end of the list (5.8, Could).
export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`habits:duplicate:${getClientKey(req)}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const existing = await prisma.habit.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const maxOrder = await prisma.habit.aggregate({
    where: { userId: session.user.id },
    _max: { sortOrder: true },
  });

  const habit = await prisma.habit.create({
    data: {
      userId: session.user.id,
      name: `${existing.name} (copy)`.slice(0, 60),
      color: existing.color,
      icon: existing.icon,
      type: existing.type,
      description: existing.description,
      goalType: existing.goalType,
      goalCount: existing.goalCount,
      isNumeric: existing.isNumeric,
      targetCount: existing.targetCount,
      unitLabel: existing.unitLabel,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(
    {
      habit: {
        id: habit.id,
        name: habit.name,
        color: habit.color,
        icon: habit.icon,
        type: habit.type,
        goalType: habit.goalType,
        goalCount: habit.goalCount,
        isNumeric: habit.isNumeric,
        targetCount: habit.targetCount,
        unitLabel: habit.unitLabel,
        sortOrder: habit.sortOrder,
        archivedAt: habit.archivedAt,
        logDates: [] as string[],
        logValues: {} as Record<string, number>,
      },
    },
    { status: 201 },
  );
}
