import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export const EXPORT_FORMAT_VERSION = 1;

// GET /api/export?format=json|csv — full data export of the signed-in
// user's habits and logs, for data portability (7.2). JSON is a
// re-importable snapshot (see /api/import); CSV is a flat, spreadsheet
// friendly view of every log entry.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`export:${getClientKey(req)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const format = new URL(req.url).searchParams.get("format") === "csv"
    ? "csv"
    : "json";

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { logs: { orderBy: { date: "asc" } } },
  });

  const timestamp = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    const rows: string[][] = [
      ["habit", "type", "date", "value", "note"],
      ...habits.flatMap((h: (typeof habits)[number]) =>
        h.logs.map((l: (typeof h.logs)[number]) => [
          h.name,
          h.type,
          l.date,
          String(l.value),
          l.note ?? "",
        ]),
      ),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((cell: string) => {
            const str = String(cell);
            return /[",\n]/.test(str)
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(","),
      )
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="core-habits-export-${timestamp}.csv"`,
      },
    });
  }

  const payload = {
    formatVersion: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    habits: habits.map((h: (typeof habits)[number]) => ({
      name: h.name,
      color: h.color,
      icon: h.icon,
      type: h.type,
      description: h.description,
      goalType: h.goalType,
      goalCount: h.goalCount,
      isNumeric: h.isNumeric,
      targetCount: h.targetCount,
      unitLabel: h.unitLabel,
      archivedAt: h.archivedAt,
      logs: h.logs.map((l: (typeof h.logs)[number]) => ({
        date: l.date,
        value: l.value,
        note: l.note,
      })),
    })),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="core-habits-export-${timestamp}.json"`,
    },
  });
}
