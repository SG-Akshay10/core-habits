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
import { GET, POST } from "@/app/api/habits/route";

const mockAuth = vi.mocked(auth);

function req(body?: unknown) {
  return new Request("http://localhost/api/habits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

beforeEach(() => {
  resetFakeDb();
  mockAuth.mockReset();
});

describe("GET /api/habits", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns only the signed-in user's habits with log dates", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    seedHabit({ userId: "user_1", name: "Read", logs: [{ id: "l1", habitId: "habit_1", date: "2026-09-29", createdAt: new Date() }] });
    seedHabit({ userId: "user_2", name: "Other user's habit" });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.habits).toHaveLength(1);
    expect(json.habits[0].name).toBe("Read");
    expect(json.habits[0].logDates).toEqual(["2026-09-29"]);
  });
});

describe("POST /api/habits", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await POST(req({ name: "Read", color: "#3b82f6" }));
    expect(res.status).toBe(401);
  });

  it("400s on missing name", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    const res = await POST(req({ name: "", color: "#3b82f6" }));
    expect(res.status).toBe(400);
  });

  it("400s on name over 60 characters", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    const res = await POST(req({ name: "a".repeat(61), color: "#3b82f6" }));
    expect(res.status).toBe(400);
  });

  it("400s on a color outside the allowed palette", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    const res = await POST(req({ name: "Read", color: "#000000" }));
    expect(res.status).toBe(400);
  });

  it("400s on malformed JSON body", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    const res = await POST(req(undefined));
    expect(res.status).toBe(400);
  });

  it("creates a habit for the signed-in user and returns it with an empty log list", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    const res = await POST(req({ name: "Read", color: "#3b82f6" }));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.habit.name).toBe("Read");
    expect(json.habit.color).toBe("#3b82f6");
    expect(json.habit.logDates).toEqual([]);
  });

  it("429s when rate-limited", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    const { rateLimit } = await import("@/lib/rate-limit");
    vi.mocked(rateLimit).mockReturnValueOnce({ success: false, remaining: 0 });
    const res = await POST(req({ name: "Read", color: "#3b82f6" }));
    expect(res.status).toBe(429);
  });
});
