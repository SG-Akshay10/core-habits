import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { dateParamSchema, logBodySchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string; date: string }> };

async function getOwnedHabit(userId: string, habitId: string) {
  return prisma.habit.findFirst({ where: { id: habitId, userId } });
}

// PUT /api/habits/:id/logs/:date — idempotent: creating an already-existing
// log is a no-op success, so double-taps never produce duplicates or errors.
export async function PUT(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`habits:log:${getClientKey(req)}`, {
    limit: 120,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id, date } = await params;
  const parsedDate = dateParamSchema.safeParse(decodeURIComponent(date));
  if (!parsedDate.success) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const habit = await getOwnedHabit(session.user.id, id);
  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const json = await req.json().catch(() => ({}));
  const parsedBody = logBodySchema.safeParse(json ?? {});
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsedBody.error.issues },
      { status: 400 },
    );
  }
  const note = parsedBody.data.note ?? null;
  const value = parsedBody.data.value ?? 1;

  await prisma.habitLog.upsert({
    where: { habitId_date: { habitId: id, date: parsedDate.data } },
    create: { habitId: id, date: parsedDate.data, note, value },
    update: { note, value },
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/habits/:id/logs/:date — idempotent removal.
export async function DELETE(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`habits:log:${getClientKey(req)}`, {
    limit: 120,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id, date } = await params;
  const parsedDate = dateParamSchema.safeParse(decodeURIComponent(date));
  if (!parsedDate.success) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const habit = await getOwnedHabit(session.user.id, id);
  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.habitLog
    .delete({
      where: { habitId_date: { habitId: id, date: parsedDate.data } },
    })
    .catch(() => {
      // Already deleted — treat as success for idempotency.
    });

  return NextResponse.json({ ok: true });
}
