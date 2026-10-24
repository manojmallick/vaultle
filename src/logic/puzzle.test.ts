import { describe, it, expect, beforeEach } from "vitest";
import { hashDay, dayKey, puzzleForDay, isSolved, swap, shareText, saveWin } from "./puzzle";
import type { VaultStats } from "./puzzle";

// Mock localStorage for Node environment
const store: Record<string, string> = {};
global.localStorage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  key: (_i: number) => null,
  length: 0,
} as Storage;

describe("dayKey", () => {
  it("returns YYYY-MM-DD format", () => {
    const key = dayKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("accepts a specific date", () => {
    expect(dayKey(new Date("2026-07-24T12:00:00Z"))).toBe("2026-07-24");
  });
});

describe("hashDay", () => {
  it("returns a positive 32-bit integer", () => {
    const h = hashDay("2026-07-24");
    expect(typeof h).toBe("number");
    expect(h).toBeGreaterThan(0);
    expect(h).toBeLessThan(2 ** 32);
  });

  it("is deterministic", () => {
    expect(hashDay("2026-07-24")).toBe(hashDay("2026-07-24"));
  });

  it("produces different hashes for different days", () => {
    expect(hashDay("2026-07-24")).not.toBe(hashDay("2026-07-25"));
  });
});

describe("puzzleForDay", () => {
  it("returns 4-element target and start arrays", () => {
    const p = puzzleForDay("2026-07-24");
    expect(p.target).toHaveLength(4);
    expect(p.start).toHaveLength(4);
  });

  it("target is a permutation of [0,1,2,3]", () => {
    const p = puzzleForDay("2026-07-24");
    expect([...p.target].sort()).toEqual([0, 1, 2, 3]);
  });

  it("start is never equal to target (not pre-solved)", () => {
    const p = puzzleForDay("2026-07-24");
    expect(p.start.every((c, i) => c === p.target[i])).toBe(false);
  });

  it("is deterministic for the same day", () => {
    const p1 = puzzleForDay("2026-07-24");
    const p2 = puzzleForDay("2026-07-24");
    expect(p1.target).toEqual(p2.target);
    expect(p1.start).toEqual(p2.start);
  });
});

describe("isSolved", () => {
  it("returns true when slots match target", () => {
    expect(isSolved([0, 1, 2, 3], [0, 1, 2, 3])).toBe(true);
  });

  it("returns false when slots differ from target", () => {
    expect(isSolved([1, 0, 2, 3], [0, 1, 2, 3])).toBe(false);
  });

  it("returns false for mismatched lengths", () => {
    expect(isSolved([0, 1], [0, 1, 2, 3])).toBe(false);
  });
});

describe("swap", () => {
  it("swaps two elements", () => {
    expect(swap([0, 1, 2, 3], 0, 1)).toEqual([1, 0, 2, 3]);
  });

  it("does not mutate original", () => {
    const original = [0, 1, 2, 3] as [0, 1, 2, 3];
    swap(original, 0, 3);
    expect(original).toEqual([0, 1, 2, 3]);
  });
});

describe("shareText", () => {
  it("contains the day", () => {
    expect(shareText("2026-07-24", 3, true)).toContain("2026-07-24");
  });

  it("shows solved squares on win", () => {
    expect(shareText("2026-07-24", 3, true)).toContain("🟩");
    expect(shareText("2026-07-24", 3, true)).toContain("3 moves");
  });

  it("shows X on loss", () => {
    expect(shareText("2026-07-24", 0, false)).toContain("X moves");
  });
});

describe("saveWin", () => {
  it("increments played and won", () => {
    const stats: VaultStats = { lastDay: null, streak: 0, played: 2, won: 1 };
    const next = saveWin("2026-07-24", stats);
    expect(next.played).toBe(3);
    expect(next.won).toBe(2);
  });

  it("starts streak at 1 for first win", () => {
    const stats: VaultStats = { lastDay: null, streak: 0, played: 0, won: 0 };
    const next = saveWin("2026-07-24", stats);
    expect(next.streak).toBe(1);
  });

  it("continues streak on consecutive days", () => {
    const stats: VaultStats = { lastDay: "2026-07-23", streak: 3, played: 5, won: 5 };
    const next = saveWin("2026-07-24", stats);
    expect(next.streak).toBe(4);
  });

  it("resets streak when day is not consecutive", () => {
    const stats: VaultStats = { lastDay: "2026-07-20", streak: 3, played: 5, won: 5 };
    const next = saveWin("2026-07-24", stats);
    expect(next.streak).toBe(1);
  });

  it("returns same stats if already won today", () => {
    const stats: VaultStats = { lastDay: "2026-07-24", streak: 3, played: 5, won: 5 };
    const next = saveWin("2026-07-24", stats);
    expect(next).toEqual(stats);
  });
});
