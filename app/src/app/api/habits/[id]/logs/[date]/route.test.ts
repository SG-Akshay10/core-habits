import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetFakeDb, seedHabit } from "@/test/fake-prisma";

vi.mock("@/lib/prisma", async () => {
  const { fakePrisma } = await import("@/test/fake-prisma");
  return { prisma: fakePrisma };
});
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({ success: true, remaining: 1 })),
  getClientKey: vi.fn(() => "test-client"),
}));
vi.mock("@/auth", () => ({ auth: vi.fn() }));

import { auth } from "@/auth";
import { PUT, DELETE } from "@/app/api/habits/[id]/logs/[date]/route";

const mockAuth = vi.mocked(auth);

function req(method: string) {
  return new Request("http://localhost/api/habits/habit_1/logs/2026-09-30", {
    method,
  });
}

function params(id: string, date: string) {
  return { params: Promise.resolve({ id, date }) };
}

beforeEach(() => {
  resetFakeDb();
  mockAuth.mockReset();
});

describe("PUT /api/habits/:id/logs/:date", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await PUT(req("PUT"), params("habit_1", "2026-09-30"));
    expect(res.status).toBe(401);
  });

  it("400s on a malformed date", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    seedHabit({ id: "habit_1", userId: "user_1" });
    const res = await PUT(req("PUT"), params("habit_1", "not-a-date"));
    expect(res.status).toBe(400);
  });

  it("404s when the habit doesn't belong to the signed-in user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    seedHabit({ id: "habit_1", userId: "user_2" });
    const res = await PUT(req("PUT"), params("habit_1", "2026-09-30"));
    expect(res.status).toBe(404);
  });

  it("creates a log for today", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    seedHabit({ id: "habit_1", userId: "user_1" });
    const res = await PUT(req("PUT"), params("habit_1", "2026-09-30"));
    expect(res.status).toBe(200);

    const { fakePrisma } = await import("@/test/fake-prisma");
    const habits = await fakePrisma.habit.findMany({
      where: { userId: "user_1" },
    });
    expect(habits[0]).toMatchObject({
      logs: [{ date: "2026-09-30" }],
    });
  });

  it("is idempotent — logging the same date twice creates one log", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    seedHabit({ id: "habit_1", userId: "user_1" });

    await PUT(req("PUT"), params("habit_1", "2026-09-30"));
    const res = await PUT(req("PUT"), params("habit_1", "2026-09-30"));
    expect(res.status).toBe(200);

    const { fakePrisma } = await import("@/test/fake-prisma");
    const habits = await fakePrisma.habit.findMany({
      where: { userId: "user_1" },
    });
    expect(habits[0].logs).toHaveLength(1);
  });
});

describe("DELETE /api/habits/:id/logs/:date", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await DELETE(req("DELETE"), params("habit_1", "2026-09-30"));
    expect(res.status).toBe(401);
  });

  it("400s on a malformed date", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    const res = await DELETE(req("DELETE"), params("habit_1", "bad-date"));
    expect(res.status).toBe(400);
  });

  it("removes an existing log", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    seedHabit({
      id: "habit_1",
      userId: "user_1",
      logs: [
        { id: "l1", habitId: "habit_1", date: "2026-09-30", createdAt: new Date() },
      ],
    });

    const res = await DELETE(req("DELETE"), params("habit_1", "2026-09-30"));
    expect(res.status).toBe(200);

    const { fakePrisma } = await import("@/test/fake-prisma");
    const habits = await fakePrisma.habit.findMany({
      where: { userId: "user_1" },
    });
    expect(habits[0].logs).toEqual([]);
  });

  it("is idempotent — deleting a log that doesn't exist still succeeds", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    seedHabit({ id: "habit_1", userId: "user_1" });

    const res = await DELETE(req("DELETE"), params("habit_1", "2026-09-30"));
    expect(res.status).toBe(200);
  });
});
