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
import { PATCH, DELETE } from "@/app/api/habits/[id]/route";

const mockAuth = vi.mocked(auth);

function req(method: string, body?: unknown) {
  return new Request("http://localhost/api/habits/habit_1", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  resetFakeDb();
  mockAuth.mockReset();
});

describe("PATCH /api/habits/:id", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await PATCH(req("PATCH", { name: "New" }), params("habit_1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when the habit doesn't belong to the signed-in user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    seedHabit({ id: "habit_1", userId: "user_2" });
    const res = await PATCH(req("PATCH", { name: "New" }), params("habit_1"));
    expect(res.status).toBe(404);
  });

  it("returns 404 for a non-existent habit id", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    const res = await PATCH(req("PATCH", { name: "New" }), params("missing"));
    expect(res.status).toBe(404);
  });

  it("400s on invalid color", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    seedHabit({ id: "habit_1", userId: "user_1" });
    const res = await PATCH(
      req("PATCH", { color: "not-a-color" }),
      params("habit_1"),
    );
    expect(res.status).toBe(400);
  });

  it("400s when neither name nor color is provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    seedHabit({ id: "habit_1", userId: "user_1" });
    const res = await PATCH(req("PATCH", {}), params("habit_1"));
    expect(res.status).toBe(400);
  });

  it("updates name and color for an owned habit", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    seedHabit({ id: "habit_1", userId: "user_1", name: "Old", color: "#3b82f6" });
    const res = await PATCH(
      req("PATCH", { name: "New name", color: "#ef4444" }),
      params("habit_1"),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.habit.name).toBe("New name");
    expect(json.habit.color).toBe("#ef4444");
  });
});

describe("DELETE /api/habits/:id", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await DELETE(req("DELETE"), params("habit_1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when the habit doesn't belong to the signed-in user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    seedHabit({ id: "habit_1", userId: "user_2" });
    const res = await DELETE(req("DELETE"), params("habit_1"));
    expect(res.status).toBe(404);
  });

  it("deletes an owned habit", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
    seedHabit({ id: "habit_1", userId: "user_1" });
    const res = await DELETE(req("DELETE"), params("habit_1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
  });
});
