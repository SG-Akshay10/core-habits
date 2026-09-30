import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { updateReminderSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string; reminderId: string }> };

async function getOwnedReminder(
  userId: string,
  habitId: string,
  reminderId: string,
) {
  return prisma.reminder.findFirst({
    where: { id: reminderId, habitId, habit: { userId } },
  });
}

// PATCH /api/habits/:id/reminders/:reminderId — update time/days/enabled.
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`reminders:update:${getClientKey(req)}`, {
    limit: 60,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id, reminderId } = await params;
  const existing = await getOwnedReminder(session.user.id, id, reminderId);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const parsed = updateReminderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const reminder = await prisma.reminder.update({
    where: { id: reminderId },
    data: {
      time: parsed.data.time,
      daysOfWeek: parsed.data.daysOfWeek,
      enabled: parsed.data.enabled,
    },
  });

  return NextResponse.json({
    reminder: {
      id: reminder.id,
      time: reminder.time,
      daysOfWeek: reminder.daysOfWeek,
      enabled: reminder.enabled,
    },
  });
}

// DELETE /api/habits/:id/reminders/:reminderId — idempotent removal.
export async function DELETE(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`reminders:delete:${getClientKey(req)}`, {
    limit: 60,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id, reminderId } = await params;
  const existing = await getOwnedReminder(session.user.id, id, reminderId);
  if (!existing) {
    return NextResponse.json({ ok: true });
  }

  await prisma.reminder.delete({ where: { id: reminderId } }).catch(() => {});

  return NextResponse.json({ ok: true });
}
