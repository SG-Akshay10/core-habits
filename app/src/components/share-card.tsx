"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildGridDates } from "@/lib/date";
import { calculateStreak } from "@/lib/streak";
import { HABIT_COLORS } from "@/lib/colors";

type ShareTheme = "light" | "dark";

/**
 * Renders a shareable streak-grid image to a <canvas>, matching the
 * on-screen grid layout, then offers Web Share API (on supporting devices)
 * or a plain PNG download (7.1). Entirely client-side — no server round
 * trip or extra image-rendering dependency.
 */
export function ShareCard({
  habitName,
  logDates,
  today,
  defaultColor,
}: {
  habitName: string;
  logDates: Set<string>;
  today: string;
  defaultColor: string;
}) {
  const [theme, setTheme] = useState<ShareTheme>("light");
  const [color, setColor] = useState(defaultColor);
  const [weeks, setWeeks] = useState<26 | 53>(26);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streak = useMemo(
    () => calculateStreak([...logDates], today),
    [logDates, today],
  );

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const columns = buildGridDates(today, weeks);
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    const width = 1200;
    const height = 630;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const bg = theme === "dark" ? "#0a0a0a" : "#ffffff";
    const fg = theme === "dark" ? "#f5f5f5" : "#111111";
    const subtle = theme === "dark" ? "#a1a1aa" : "#6b7280";
    const empty = theme === "dark" ? "#27272a" : "#e5e7eb";

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Header.
    ctx.fillStyle = fg;
    ctx.font = "600 44px system-ui, -apple-system, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(habitName, 60, 56);

    ctx.fillStyle = subtle;
    ctx.font = "500 24px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      `${streak.current}-day current streak · ${streak.longest}-day best`,
      60,
      118,
    );

    // Grid.
    const gridTop = 190;
    const gridLeft = 60;
    const gridWidth = width - 120;
    const gridHeight = 340;
    const gap = 3;
    const cellW = gridWidth / columns.length - gap;
    const cellH = gridHeight / 7 - gap;
    const cellSize = Math.min(cellW, cellH);
    const actualGridWidth = columns.length * (cellSize + gap) - gap;
    const offsetX = gridLeft + (gridWidth - actualGridWidth) / 2;

    columns.forEach((column, colIdx) => {
      column.forEach((date, rowIdx) => {
        const isFuture = date > today;
        const isLogged = logDates.has(date);
        const x = offsetX + colIdx * (cellSize + gap);
        const y = gridTop + rowIdx * (cellSize + gap);
        ctx.fillStyle = isFuture ? "transparent" : isLogged ? color : empty;
        if (!isFuture) {
          const r = 3;
          ctx.beginPath();
          ctx.roundRect(x, y, cellSize, cellSize, r);
          ctx.fill();
        }
      });
    });

    // Footer.
    ctx.fillStyle = subtle;
    ctx.font = "500 20px system-ui, -apple-system, sans-serif";
    ctx.fillText("Core Habits", 60, height - 56);
  }

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, color, weeks, habitName, today]);

  async function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${habitName.toLowerCase().replace(/\s+/g, "-")}-streak.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setError(null);
    setBusy(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Could not render image");
      const file = new File([blob], "streak.png", { type: "image/png" });
      if (
        typeof navigator !== "undefined" &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `${habitName} streak`,
          text: `My ${streak.current}-day streak on ${habitName}`,
        });
      } else {
        await handleDownload();
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setError("Couldn't share — try downloading instead.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <canvas ref={canvasRef} className="block w-full" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1" role="group" aria-label="Card theme">
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={theme === t}
              onClick={() => setTheme(t)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                theme === t
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            >
              {t === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>

        <div className="flex gap-1" role="group" aria-label="Time range">
          {(
            [
              { value: 26 as const, label: "6 mo" },
              { value: 53 as const, label: "1 yr" },
            ]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={weeks === opt.value}
              onClick={() => setWeeks(opt.value)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                weeks === opt.value
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1" role="group" aria-label="Card color">
          {HABIT_COLORS.slice(0, 10).map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full ${
                color === c ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={handleShare}
          disabled={busy}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
        >
          {busy ? "Preparing…" : "Share"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}
