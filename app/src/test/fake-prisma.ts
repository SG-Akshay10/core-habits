import { vi } from "vitest";

/**
 * Minimal in-memory stand-in for the Prisma client, scoped to exactly the
 * calls the habit API routes make. Reset between tests via `resetFakeDb()`.
 */
type FakeLog = {
  id: string;
  habitId: string;
  date: string;
  note?: string | null;
  value?: number;
  createdAt: Date;
};
type FakeHabit = {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string | null;
  type: "build" | "quit";
  description: string | null;
  goalType: "daily" | "weekly" | "monthly";
  goalCount: number;
  isNumeric: boolean;
  targetCount: number;
  unitLabel: string | null;
  sortOrder: number;
  archivedAt: Date | null;
  createdAt: Date;
  logs: FakeLog[];
};

let habits: FakeHabit[] = [];
let idCounter = 0;

export function resetFakeDb() {
  habits = [];
  idCounter = 0;
}

export function seedHabit(overrides: Partial<FakeHabit> = {}): FakeHabit {
  const habit: FakeHabit = {
    id: overrides.id ?? `habit_${++idCounter}`,
    userId: overrides.userId ?? "user_1",
    name: overrides.name ?? "Read",
    color: overrides.color ?? "#3b82f6",
    icon: overrides.icon ?? null,
    type: overrides.type ?? "build",
    description: overrides.description ?? null,
    goalType: overrides.goalType ?? "daily",
    goalCount: overrides.goalCount ?? 1,
    isNumeric: overrides.isNumeric ?? false,
    targetCount: overrides.targetCount ?? 1,
    unitLabel: overrides.unitLabel ?? null,
    sortOrder: overrides.sortOrder ?? 0,
    archivedAt: overrides.archivedAt ?? null,
    createdAt: overrides.createdAt ?? new Date(),
    logs: overrides.logs ?? [],
  };
  habits.push(habit);
  return habit;
}

function stripLogs(h: FakeHabit) {
  const { logs, ...rest } = h;
  return {
    ...rest,
    logs: logs.map((l) => ({
      date: l.date,
      note: l.note ?? null,
      value: l.value ?? 1,
    })),
  };
}

export const fakePrisma = {
  habit: {
    findMany: vi.fn(
      async ({
        where,
      }: {
        where: { userId: string; archivedAt?: null | { not: null } };
      }) => {
        return habits
          .filter((h) => {
            if (h.userId !== where.userId) return false;
            if (where.archivedAt === null) return h.archivedAt === null;
            if (
              where.archivedAt &&
              typeof where.archivedAt === "object" &&
              "not" in where.archivedAt
            ) {
              return h.archivedAt !== null;
            }
            return true;
          })
          .map(stripLogs);
      },
    ),
    findFirst: vi.fn(
      async ({ where }: { where: { id: string; userId: string } }) => {
        const h = habits.find(
          (x) => x.id === where.id && x.userId === where.userId,
        );
        return h ? stripLogs(h) : null;
      },
    ),
    create: vi.fn(
      async ({
        data,
      }: {
        data: {
          userId: string;
          name: string;
          color: string;
          icon?: string | null;
          type?: "build" | "quit";
          description?: string;
          goalType?: "daily" | "weekly" | "monthly";
          goalCount?: number;
          isNumeric?: boolean;
          targetCount?: number;
          unitLabel?: string | null;
          sortOrder?: number;
        };
      }) => {
        const habit: FakeHabit = {
          id: `habit_${++idCounter}`,
          userId: data.userId,
          name: data.name,
          color: data.color,
          icon: data.icon ?? null,
          type: data.type ?? "build",
          description: data.description ?? null,
          goalType: data.goalType ?? "daily",
          goalCount: data.goalCount ?? 1,
          isNumeric: data.isNumeric ?? false,
          targetCount: data.targetCount ?? 1,
          unitLabel: data.unitLabel ?? null,
          sortOrder: data.sortOrder ?? 0,
          archivedAt: null,
          createdAt: new Date(),
          logs: [],
        };
        habits.push(habit);
        return { ...habit, logs: undefined } as unknown as FakeHabit;
      },
    ),
    update: vi.fn(
      async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<{
          name: string;
          color: string;
          icon: string | null;
          type: "build" | "quit";
          description: string;
          goalType: "daily" | "weekly" | "monthly";
          goalCount: number;
          isNumeric: boolean;
          targetCount: number;
          unitLabel: string | null;
          sortOrder: number;
          archivedAt: Date | null;
        }>;
      }) => {
        const h = habits.find((x) => x.id === where.id);
        if (!h) throw new Error("not found");
        if (data.name !== undefined) h.name = data.name;
        if (data.color !== undefined) h.color = data.color;
        if (data.icon !== undefined) h.icon = data.icon;
        if (data.type !== undefined) h.type = data.type;
        if (data.description !== undefined) h.description = data.description;
        if (data.goalType !== undefined) h.goalType = data.goalType;
        if (data.goalCount !== undefined) h.goalCount = data.goalCount;
        if (data.isNumeric !== undefined) h.isNumeric = data.isNumeric;
        if (data.targetCount !== undefined) h.targetCount = data.targetCount;
        if (data.unitLabel !== undefined) h.unitLabel = data.unitLabel;
        if (data.sortOrder !== undefined) h.sortOrder = data.sortOrder;
        if (data.archivedAt !== undefined) h.archivedAt = data.archivedAt;
        return {
          id: h.id,
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
          sortOrder: h.sortOrder,
          archivedAt: h.archivedAt,
        };
      },
    ),
    aggregate: vi.fn(
      async ({ where }: { where: { userId: string } }) => {
        const mine = habits.filter((h) => h.userId === where.userId);
        const max = mine.reduce((m, h) => Math.max(m, h.sortOrder), 0);
        return { _max: { sortOrder: mine.length ? max : null } };
      },
    ),
    delete: vi.fn(async ({ where }: { where: { id: string } }) => {
      const idx = habits.findIndex((x) => x.id === where.id);
      if (idx === -1) throw new Error("not found");
      const [removed] = habits.splice(idx, 1);
      return removed;
    }),
  },
  $transaction: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
  habitLog: {
    upsert: vi.fn(
      async ({
        where,
        create,
        update,
      }: {
        where: { habitId_date: { habitId: string; date: string } };
        create?: { note?: string | null; value?: number };
        update?: { note?: string | null; value?: number };
      }) => {
        const { habitId, date } = where.habitId_date;
        const habit = habits.find((h) => h.id === habitId);
        if (!habit) throw new Error("not found");
        let log = habit.logs.find((l) => l.date === date);
        if (!log) {
          log = {
            id: `log_${++idCounter}`,
            habitId,
            date,
            note: create?.note ?? null,
            value: create?.value ?? 1,
            createdAt: new Date(),
          };
          habit.logs.push(log);
        } else {
          if (update?.note !== undefined) log.note = update.note;
          if (update?.value !== undefined) log.value = update.value;
        }
        return log;
      },
    ),
    delete: vi.fn(
      async ({
        where,
      }: {
        where: { habitId_date: { habitId: string; date: string } };
      }) => {
        const { habitId, date } = where.habitId_date;
        const habit = habits.find((h) => h.id === habitId);
        const idx = habit?.logs.findIndex((l) => l.date === date) ?? -1;
        if (!habit || idx === -1) {
          // Mirrors Prisma's P2025 "record not found" throw on delete.
          throw new Error("Record to delete does not exist.");
        }
        const [removed] = habit.logs.splice(idx, 1);
        return removed;
      },
    ),
  },
};

