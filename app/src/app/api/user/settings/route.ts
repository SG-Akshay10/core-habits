import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { weekStartDaySchema } from "@/lib/validation";

const bodySchema = z.object({
  weekStartDay: weekStartDaySchema,
});

// GET /api/user/settings — currently just the week-start-day preference.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { weekStartDay: true },
  });

  return NextResponse.json({ weekStartDay: user?.weekStartDay ?? 0 });
}

// POST /api/user/settings — update the week-start-day preference used for
// weekly goal progress and week streaks.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`settings:${getClientKey(req)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { weekStartDay: parsed.data.weekStartDay },
  });

  return NextResponse.json({ ok: true });
}
