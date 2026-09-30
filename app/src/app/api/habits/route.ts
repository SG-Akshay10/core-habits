import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { createHabitSchema } from "@/lib/validation";

// GET /api/habits — list the signed-in user's habits with all logs.
// Logs are returned as flat YYYY-MM-DD strings; the client builds the grid.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    include: {
      logs: {
        select: { date: true, value: true },
      },
    },
  });

  return NextResponse.json({
    habits: habits.map((h: (typeof habits)[number]) => ({
      id: h.id,
      name: h.name,
      color: h.color,
      type: h.type,
      description: h.description,
      goalType: h.goalType,
      goalCount: h.goalCount,
      isNumeric: h.isNumeric,
      targetCount: h.targetCount,
      unitLabel: h.unitLabel,
      createdAt: h.createdAt,
      logDates: h.logs.map((l: { date: string }) => l.date),
      logValues: Object.fromEntries(
        h.logs.map((l: { date: string; value: number }) => [l.date, l.value]),
      ),
    })),
  });
}

// POST /api/habits — create a habit for the signed-in user.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`habits:create:${getClientKey(req)}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = createHabitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const habit = await prisma.habit.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      color: parsed.data.color,
      type: parsed.data.type,
      description: parsed.data.description,
      goalType: parsed.data.goalType,
      goalCount: parsed.data.goalCount,
      isNumeric: parsed.data.isNumeric,
      targetCount: parsed.data.targetCount,
      unitLabel: parsed.data.unitLabel,
    },
  });

  return NextResponse.json(
    {
      habit: {
        id: habit.id,
        name: habit.name,
        color: habit.color,
        type: habit.type,
        description: habit.description,
        goalType: habit.goalType,
        goalCount: habit.goalCount,
        isNumeric: habit.isNumeric,
        targetCount: habit.targetCount,
        unitLabel: habit.unitLabel,
        createdAt: habit.createdAt,
        logDates: [] as string[],
        logValues: {} as Record<string, number>,
      },
    },
    { status: 201 },
  );
}
