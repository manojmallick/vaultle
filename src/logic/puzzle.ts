/** Daily spatial vault puzzle — seed by date (Wordle loop × Cubism) */

export const COLORS = ["#f97316", "#38bdf8", "#a78bfa", "#34d399"] as const;
export type ColorId = 0 | 1 | 2 | 3;

export interface DailyPuzzle {
  /** YYYY-MM-DD */
  day: string;
  /** Target sequence of 4 color slots (front row of the vault) */
  target: ColorId[];
  /** Scrambled starting palette (player arranges into slots) */
  start: ColorId[];
}

/** Mulberry32 PRNG */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function hashDay(day: string): number {
  let h = 2166136261;
  for (let i = 0; i < day.length; i++) {
    h ^= day.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function puzzleForDay(day = dayKey()): DailyPuzzle {
  const rng = mulberry32(hashDay(day) || 1);
  const target: ColorId[] = [0, 1, 2, 3];
  // shuffle target
  for (let i = target.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [target[i], target[j]] = [target[j]!, target[i]!];
  }
  // start is a different shuffle
  const start: ColorId[] = [...target];
  for (let i = start.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [start[i], start[j]] = [start[j]!, start[i]!];
  }
  // ensure not already solved
  if (start.every((c, i) => c === target[i])) {
    [start[0], start[1]] = [start[1]!, start[0]!];
  }
  return { day, target, start };
}

export function isSolved(slots: ColorId[], target: ColorId[]): boolean {
  return slots.length === target.length && slots.every((c, i) => c === target[i]);
}

export function swap(slots: ColorId[], a: number, b: number): ColorId[] {
  const next = [...slots];
  [next[a], next[b]] = [next[b]!, next[a]!];
  return next;
}

export function shareText(
  day: string,
  moves: number,
  solved: boolean,
): string {
  const squares = solved ? "🟩🟩🟩🟩" : "⬜⬜⬜⬜";
  return `Vaultle ${day}\n${squares}\n${solved ? moves : "X"} moves\nvaultle.app`;
}

export interface VaultStats {
  lastDay: string | null;
  streak: number;
  played: number;
  won: number;
}

const STATS_KEY = "vaultle-stats-v1";

export function loadStats(): VaultStats {
  if (typeof window === "undefined") {
    return { lastDay: null, streak: 0, played: 0, won: 0 };
  }
  try {
    return {
      lastDay: null,
      streak: 0,
      played: 0,
      won: 0,
      ...JSON.parse(localStorage.getItem(STATS_KEY) || "{}"),
    };
  } catch {
    return { lastDay: null, streak: 0, played: 0, won: 0 };
  }
}

export function saveWin(day: string, stats: VaultStats): VaultStats {
  let streak = 1;
  if (stats.lastDay) {
    const prev = new Date(stats.lastDay + "T12:00:00");
    const cur = new Date(day + "T12:00:00");
    const diff = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (diff === 0) return stats; // already counted
    if (diff === 1) streak = stats.streak + 1;
  }
  const next = {
    lastDay: day,
    streak,
    played: stats.played + 1,
    won: stats.won + 1,
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(next));
  return next;
}
