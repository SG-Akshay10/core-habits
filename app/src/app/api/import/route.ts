import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { isValidHabitColor, HABIT_COLORS } from "@/lib/colors";
import { HABIT_ICONS } from "@/lib/icons";
import { importPayloadSchema } from "@/lib/validation";

const ICON_NAMES = new Set<string>(HABIT_ICONS.map((i) => i.name));

// POST /api/import — import habits + logs from a Core Habits JSON export
// (7.3). Body: `{ payload, mode }` where `mode` is:
//   - "preview" (default): validates and reports what would happen,
//     without writing anything.
//   - "apply": performs the import.
// Duplicate handling: an incoming habit is matched to an existing one by
// case-insensitive name. For a match, only log dates the user doesn't
// already have are added (existing logs are never overwritten). New
// habits are created with sortOrder appended after existing habits.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`import:${getClientKey(req)}`, {
    limit: 5,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const mode = json?.mode === "apply" ? "apply" : "preview";
  const parsed = importPayloadSchema.safeParse(json?.payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid import file", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existingHabits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, logs: { select: { date: true } } },
  });
  const existingByName = new Map<string, (typeof existingHabits)[number]>(
    existingHabits.map((h: (typeof existingHabits)[number]) => [
      h.name.trim().toLowerCase(),
      h,
    ]),
  );

  const plan = parsed.data.habits.map((habit) => {
    const key = habit.name.trim().toLowerCase();
    const existing = existingByName.get(key);
    const existingDates = existing
      ? new Set(existing.logs.map((l: { date: string }) => l.date))
      : new Set<string>();
    const newLogs = habit.logs.filter((l) => !existingDates.has(l.date));
    const color = isValidHabitColor(habit.color)
      ? habit.color
      : HABIT_COLORS[0];
    const icon: string | null =
      habit.icon && ICON_NAMES.has(habit.icon) ? habit.icon : null;
    return {
      name: habit.name,
      color,
      icon,
      type: habit.type,
      description: habit.description ?? null,
      goalType: habit.goalType,
      goalCount: habit.goalCount,
      isNumeric: habit.isNumeric,
      targetCount: habit.targetCount,
      unitLabel: habit.unitLabel ?? null,
      logs: newLogs,
      willCreateHabit: !existing,
      existingHabitId: existing?.id ?? null,
      skippedLogCount: habit.logs.length - newLogs.length,
    };
  });

  if (mode === "preview") {
    return NextResponse.json({
      preview: {
        habitsToCreate: plan.filter((p) => p.willCreateHabit).length,
        habitsToMerge: plan.filter((p) => !p.willCreateHabit).length,
        logsToAdd: plan.reduce((sum, p) => sum + p.logs.length, 0),
        logsSkippedAsDuplicates: plan.reduce(
          (sum, p) => sum + p.skippedLogCount,
          0,
        ),
        habits: plan.map((p) => ({
          name: p.name,
          action: p.willCreateHabit ? "create" : "merge",
          newLogs: p.logs.length,
          skippedLogs: p.skippedLogCount,
        })),
      },
    });
  }

  const maxOrder = await prisma.habit.aggregate({
    where: { userId: session.user.id },
    _max: { sortOrder: true },
  });
  let nextOrder = (maxOrder._max.sortOrder ?? 0) + 1;

  let habitsCreated = 0;
  let habitsMerged = 0;
  let logsAdded = 0;

  for (const p of plan) {
    let habitId = p.existingHabitId;
    if (!habitId) {
      const created = await prisma.habit.create({
        data: {
          userId: session.user.id,
          name: p.name,
          color: p.color,
          icon: p.icon,
          type: p.type,
          description: p.description,
          goalType: p.goalType,
          goalCount: p.goalCount,
          isNumeric: p.isNumeric,
          targetCount: p.targetCount,
          unitLabel: p.unitLabel,
          sortOrder: nextOrder++,
        },
      });
      habitId = created.id;
      habitsCreated += 1;
    } else {
      habitsMerged += 1;
    }

    if (p.logs.length > 0) {
      const result = await prisma.habitLog.createMany({
        data: p.logs.map((l) => ({
          habitId: habitId!,
          date: l.date,
          value: l.value,
          note: l.note ?? null,
        })),
        skipDuplicates: true,
      });
      logsAdded += result.count;
    }
  }

  return NextResponse.json({
    result: { habitsCreated, habitsMerged, logsAdded },
  });
}
