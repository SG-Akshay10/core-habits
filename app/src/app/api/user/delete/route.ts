import { NextResponse } from "next/server";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`delete-account:${getClientKey(req)}`, {
    limit: 3,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Deleting the user cascades to Account/Session rows (and, from Week 2+,
  // every habit/log row scoped to this user) via `onDelete: Cascade` in the
  // Prisma schema's foreign keys.
  await prisma.user.delete({ where: { id: session.user.id } });

  await signOut({ redirect: false });

  return NextResponse.json({ ok: true });
}
