"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  dayKey,
  isSolved,
  loadStats,
  puzzleForDay,
  saveWin,
  shareText,
  swap,
  type ColorId,
  type VaultStats,
} from "@/src/logic/puzzle";

const VaultCanvas = dynamic(
  () => import("@/src/logic/VaultCanvas").then((m) => m.VaultCanvas),
  {
    ssr: false,
    loading: () => <div className="stage loading">Loading vault…</div>,
  },
);

export default function Home() {
  const day = useMemo(() => dayKey(), []);
  const puzzle = useMemo(() => puzzleForDay(day), [day]);
  const [slots, setSlots] = useState<ColorId[]>(puzzle.start);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const solved = isSolved(slots, puzzle.target);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  useEffect(() => {
    if (solved && stats) {
      setStats(saveWin(day, stats));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on solve edge
  }, [solved]);

  const onSelect = useCallback(
    (index: number) => {
      if (solved) return;
      if (selected == null) {
        setSelected(index);
        return;
      }
      if (selected === index) {
        setSelected(null);
        return;
      }
      setSlots((s) => swap(s, selected, index));
      setMoves((m) => m + 1);
      setSelected(null);
    },
    [selected, solved],
  );

  async function copyShare() {
    const text = shareText(day, moves, solved);
    try {
      await navigator.clipboard.writeText(text);
      setFlash("Copied share text");
    } catch {
      setFlash(text);
    }
    setTimeout(() => setFlash(null), 2000);
  }

  async function enterXR(mode: "vr" | "ar") {
    const { xrStore } = await import("@/src/logic/VaultCanvas");
    try {
      if (mode === "vr") await xrStore.enterVR();
      else await xrStore.enterAR();
    } catch {
      setFlash("WebXR needs Quest Browser / headset — desktop works fine");
      setTimeout(() => setFlash(null), 2500);
    }
  }

  return (
    <main className="shell">
      <header>
        <div>
          <h1>
            Vault<span>le</span>
          </h1>
          <p className="tag">
            Daily spatial lock · same puzzle desktop & headset · {day}
          </p>
        </div>
        <div className="stats">
          <span>🔥 {stats?.streak ?? 0}</span>
          <span>
            {stats?.won ?? 0}/{stats?.played ?? 0} won
          </span>
        </div>
      </header>

      {flash ? <div className="flash">{flash}</div> : null}

      <p className="lede">
        Tap two blocks to swap. Match the vault&apos;s hidden order — one puzzle
        per day (Wordle loop × Cubism). Hand-track in XR when you can.
      </p>

      <div className="stage">
        <VaultCanvas
          slots={slots}
          selected={selected}
          solved={solved}
          onSelect={onSelect}
        />
      </div>

      <div className="bar">
        <span>
          Moves: <strong>{moves}</strong>
          {solved ? " · Solved!" : ""}
        </span>
        <div className="actions">
          <button type="button" className="btn" onClick={() => void enterXR("ar")}>
            Enter AR
          </button>
          <button type="button" className="btn" onClick={() => void enterXR("vr")}>
            Enter VR
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setSlots([...puzzle.start]);
              setMoves(0);
              setSelected(null);
            }}
            disabled={solved}
          >
            Reset
          </button>
          <button type="button" className="btn primary" onClick={() => void copyShare()}>
            Share
          </button>
        </div>
      </div>

      <p className="legal">
        Daily puzzle prototype. Not affiliated with Wordle.
      </p>
    </main>
  );
}
