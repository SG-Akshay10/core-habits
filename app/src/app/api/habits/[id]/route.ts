import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { updateHabitSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

async function getOwnedHabit(userId: string, habitId: string) {
  return prisma.habit.findFirst({ where: { id: habitId, userId } });
}

// GET /api/habits/:id — a single owned habit with its full log history
// (including notes), for the habit detail page (grid + calendar + streaks).
export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const habit = await prisma.habit.findFirst({
    where: { id, userId: session.user.id },
    include: { logs: { select: { date: true, note: true, value: true } } },
  });
  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    habit: {
      id: habit.id,
      name: habit.name,
      color: habit.color,
      icon: habit.icon,
      type: habit.type,
      description: habit.description,
      goalType: habit.goalType,
      goalCount: habit.goalCount,
      isNumeric: habit.isNumeric,
      targetCount: habit.targetCount,
      unitLabel: habit.unitLabel,
      archivedAt: habit.archivedAt,
      createdAt: habit.createdAt,
      logs: habit.logs,
    },
  });
}

// PATCH /api/habits/:id — update name, color, type and/or description.
// Ownership enforced server-side; never trust a habit id belonging to
// another user.
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`habits:update:${getClientKey(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const existing = await getOwnedHabit(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const parsed = updateHabitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const habit = await prisma.habit.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.color !== undefined ? { color: parsed.data.color } : {}),
      ...(parsed.data.icon !== undefined ? { icon: parsed.data.icon } : {}),
      ...(parsed.data.type !== undefined ? { type: parsed.data.type } : {}),
      ...(parsed.data.description !== undefined
        ? { description: parsed.data.description }
        : {}),
      ...(parsed.data.goalType !== undefined
        ? { goalType: parsed.data.goalType }
        : {}),
      ...(parsed.data.goalCount !== undefined
        ? { goalCount: parsed.data.goalCount }
        : {}),
      ...(parsed.data.isNumeric !== undefined
        ? { isNumeric: parsed.data.isNumeric }
        : {}),
      ...(parsed.data.targetCount !== undefined
        ? { targetCount: parsed.data.targetCount }
        : {}),
      ...(parsed.data.unitLabel !== undefined
        ? { unitLabel: parsed.data.unitLabel }
        : {}),
      // Archiving is a soft delete: set/clear archivedAt, never a hard
      // delete, so history is always preserved and restorable.
      ...(parsed.data.archived !== undefined
        ? { archivedAt: parsed.data.archived ? new Date() : null }
        : {}),
    },
  });

  return NextResponse.json({
    habit: {
      id: habit.id,
      name: habit.name,
      color: habit.color,
      icon: habit.icon,
      type: habit.type,
      description: habit.description,
      goalType: habit.goalType,
      goalCount: habit.goalCount,
      isNumeric: habit.isNumeric,
      targetCount: habit.targetCount,
      unitLabel: habit.unitLabel,
      archivedAt: habit.archivedAt,
    },
  });
}

// DELETE /api/habits/:id — cascades to HabitLog rows via the FK.
export async function DELETE(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedHabit(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.habit.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
