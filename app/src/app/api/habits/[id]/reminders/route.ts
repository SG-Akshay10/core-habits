import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { createReminderSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

async function getOwnedHabit(userId: string, habitId: string) {
  return prisma.habit.findFirst({ where: { id: habitId, userId } });
}

// GET /api/habits/:id/reminders — list reminders for a habit.
export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const habit = await getOwnedHabit(session.user.id, id);
  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const reminders = await prisma.reminder.findMany({
    where: { habitId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    reminders: reminders.map((r: (typeof reminders)[number]) => ({
      id: r.id,
      time: r.time,
      daysOfWeek: r.daysOfWeek,
      enabled: r.enabled,
    })),
  });
}

// POST /api/habits/:id/reminders — create a reminder (opt-in only; multiple
// reminders per habit are allowed).
export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`reminders:create:${getClientKey(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const habit = await getOwnedHabit(session.user.id, id);
  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const parsed = createReminderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const reminder = await prisma.reminder.create({
    data: {
      habitId: id,
      time: parsed.data.time,
      daysOfWeek: parsed.data.daysOfWeek,
      enabled: parsed.data.enabled,
    },
  });

  return NextResponse.json(
    {
      reminder: {
        id: reminder.id,
        time: reminder.time,
        daysOfWeek: reminder.daysOfWeek,
        enabled: reminder.enabled,
      },
    },
    { status: 201 },
  );
}
