import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { reorderHabitsSchema } from "@/lib/validation";

// POST /api/habits/reorder — persist a new drag-and-drop (or keyboard move)
// order for the signed-in user's habits.
//
// Validates that every id in the request actually belongs to the
// requesting user before writing anything, so one user can't tamper with
// another's data via a crafted request (PRD production consideration).
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`habits:reorder:${getClientKey(req)}`, {
    limit: 60,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = reorderHabitsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { ids } = parsed.data;

  const owned = await prisma.habit.findMany({
    where: { id: { in: ids }, userId: session.user.id },
    select: { id: true },
  });
  if (owned.length !== ids.length) {
    return NextResponse.json(
      { error: "One or more habits not found" },
      { status: 404 },
    );
  }

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.habit.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
