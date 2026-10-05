import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import {
  weekStartDaySchema,
  themeSchema,
  defaultViewSchema,
} from "@/lib/validation";

const bodySchema = z.object({
  weekStartDay: weekStartDaySchema.optional(),
  theme: themeSchema.optional(),
  defaultView: defaultViewSchema.optional(),
});

// GET /api/user/settings — week-start-day, theme, and default dashboard
// view preferences. Stored server-side (not just localStorage) so they
// follow the user across devices.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { weekStartDay: true, theme: true, defaultView: true },
  });

  return NextResponse.json({
    weekStartDay: user?.weekStartDay ?? 0,
    theme: user?.theme === "dark" ? "dark" : "light",
    defaultView: user?.defaultView ?? "cards",
  });
}

// POST /api/user/settings — update any subset of the week-start-day,
// theme, and default view preferences. These are cheap, frequent writes
// (e.g. toggling dark mode), so only the fields provided are updated —
// no unrelated writes, and no full-page reload is required client-side.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`settings:${getClientKey(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { weekStartDay, theme, defaultView } = parsed.data;
  if (
    weekStartDay === undefined &&
    theme === undefined &&
    defaultView === undefined
  ) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(weekStartDay !== undefined ? { weekStartDay } : {}),
      ...(theme !== undefined ? { theme } : {}),
      ...(defaultView !== undefined ? { defaultView } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
