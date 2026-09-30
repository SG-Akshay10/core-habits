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
  createdAt: Date;
};
type FakeHabit = {
  id: string;
  userId: string;
  name: string;
  color: string;
  type: "build" | "quit";
  description: string | null;
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
    type: overrides.type ?? "build",
    description: overrides.description ?? null,
    createdAt: overrides.createdAt ?? new Date(),
    logs: overrides.logs ?? [],
  };
  habits.push(habit);
  return habit;
}

function stripLogs(h: FakeHabit) {
  const { logs, ...rest } = h;
  return { ...rest, logs: logs.map((l) => ({ date: l.date, note: l.note ?? null })) };
}

export const fakePrisma = {
  habit: {
    findMany: vi.fn(async ({ where }: { where: { userId: string } }) => {
      return habits
        .filter((h) => h.userId === where.userId)
        .map(stripLogs);
    }),
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
          type?: "build" | "quit";
          description?: string;
        };
      }) => {
        const habit: FakeHabit = {
          id: `habit_${++idCounter}`,
          userId: data.userId,
          name: data.name,
          color: data.color,
          type: data.type ?? "build",
          description: data.description ?? null,
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
          type: "build" | "quit";
          description: string;
        }>;
      }) => {
        const h = habits.find((x) => x.id === where.id);
        if (!h) throw new Error("not found");
        if (data.name !== undefined) h.name = data.name;
        if (data.color !== undefined) h.color = data.color;
        if (data.type !== undefined) h.type = data.type;
        if (data.description !== undefined) h.description = data.description;
        return {
          id: h.id,
          name: h.name,
          color: h.color,
          type: h.type,
          description: h.description,
        };
      },
    ),
    delete: vi.fn(async ({ where }: { where: { id: string } }) => {
      const idx = habits.findIndex((x) => x.id === where.id);
      if (idx === -1) throw new Error("not found");
      const [removed] = habits.splice(idx, 1);
      return removed;
    }),
  },
  habitLog: {
    upsert: vi.fn(
      async ({
        where,
        create,
        update,
      }: {
        where: { habitId_date: { habitId: string; date: string } };
        create?: { note?: string | null };
        update?: { note?: string | null };
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
            createdAt: new Date(),
          };
          habit.logs.push(log);
        } else if (update?.note !== undefined) {
          log.note = update.note;
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

