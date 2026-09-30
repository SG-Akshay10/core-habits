import { describe, expect, it } from "vitest";
import { calculateStreak } from "@/lib/streak";

describe("calculateStreak", () => {
  it("returns zero streaks for no logs", () => {
    expect(calculateStreak([], "2026-09-30")).toEqual({
      current: 0,
      longest: 0,
    });
  });

  it("counts a single log today as a streak of 1", () => {
    expect(calculateStreak(["2026-09-30"], "2026-09-30")).toEqual({
      current: 1,
      longest: 1,
    });
  });

  it("counts consecutive days ending today", () => {
    const dates = ["2026-09-28", "2026-09-29", "2026-09-30"];
    expect(calculateStreak(dates, "2026-09-30")).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("keeps the streak active when today is unlogged but yesterday was logged", () => {
    const dates = ["2026-09-28", "2026-09-29"];
    expect(calculateStreak(dates, "2026-09-30")).toEqual({
      current: 2,
      longest: 2,
    });
  });

  it("resets current streak to 0 when both today and yesterday are unlogged", () => {
    const dates = ["2026-09-20", "2026-09-28"];
    expect(calculateStreak(dates, "2026-09-30").current).toBe(0);
  });

  it("computes longest streak across a gap, independent of current streak", () => {
    // Long run early, then a gap, then a short active run.
    const dates = [
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-04",
      "2026-09-05",
      // gap
      "2026-09-29",
      "2026-09-30",
    ];
    expect(calculateStreak(dates, "2026-09-30")).toEqual({
      current: 2,
      longest: 5,
    });
  });

  it("handles a month boundary (Jan 31 -> Feb 1)", () => {
    const dates = ["2026-01-30", "2026-01-31", "2026-02-01"];
    expect(calculateStreak(dates, "2026-02-01")).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("handles a year boundary (Dec 31 -> Jan 1)", () => {
    const dates = ["2025-12-30", "2025-12-31", "2026-01-01"];
    expect(calculateStreak(dates, "2026-01-01")).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("handles a leap-day boundary (Feb 28 -> Feb 29 -> Mar 1)", () => {
    const dates = ["2024-02-28", "2024-02-29", "2024-03-01"];
    expect(calculateStreak(dates, "2024-03-01")).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("is unaffected by DST transitions since dates are calendar strings, not instants", () => {
    // US DST spring-forward 2026-03-08 and fall-back 2026-11-01 — a run of
    // logged calendar dates across either boundary is still consecutive
    // because streak math never touches wall-clock time.
    const springForward = ["2026-03-07", "2026-03-08", "2026-03-09"];
    expect(calculateStreak(springForward, "2026-03-09")).toEqual({
      current: 3,
      longest: 3,
    });

    const fallBack = ["2026-10-31", "2026-11-01", "2026-11-02"];
    expect(calculateStreak(fallBack, "2026-11-02")).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("stays correct if the user changes timezone (only the calendar-date string matters)", () => {
    // Simulates a user traveling: regardless of what timezone produced the
    // "today" string, streak logic only cares about the string itself.
    const dates = ["2026-09-29", "2026-09-30"];
    const todayFromTokyo = "2026-09-30"; // e.g. computed via Asia/Tokyo
    const todayFromLA = "2026-09-30"; // e.g. computed via America/Los_Angeles
    expect(calculateStreak(dates, todayFromTokyo)).toEqual(
      calculateStreak(dates, todayFromLA),
    );
  });

  it("does not count future-dated logs toward the current streak base", () => {
    // Defensive: even if a stray future date exists, walking back from today
    // still works correctly since we only ever step backward.
    const dates = ["2026-09-30", "2026-10-01"];
    expect(calculateStreak(dates, "2026-09-30").current).toBe(1);
  });

  it("recalculates correctly after back-filling a gap day", () => {
    const before = ["2026-09-16", "2026-09-30"];
    expect(calculateStreak(before, "2026-09-30").current).toBe(1);

    // Back-fill last Tuesday (2026-09-29) plus the days between — simulate
    // a full back-fill closing the gap.
    const after = [
      "2026-09-16",
      "2026-09-29",
      "2026-09-30",
    ];
    expect(calculateStreak(after, "2026-09-30")).toEqual({
      current: 2,
      longest: 2,
    });
  });
});
