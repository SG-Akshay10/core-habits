import type { MonthlyCount } from "@/lib/stats";

/** Formats `YYYY-MM` as a short month label, e.g. "Jan". */
function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}

/**
 * Simple dependency-free SVG bar chart of completions per month (last 12
 * months). Renders sensibly with 0, 1, or 12 data points.
 */
export function MonthlyChart({
  data,
  color,
}: {
  data: MonthlyCount[];
  color: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 320;
  const height = 120;
  const barGap = 6;
  const barWidth =
    data.length > 0 ? (width - barGap * (data.length - 1)) / data.length : 0;

  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-400">No data yet for this habit.</p>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height + 20}`}
      className="w-full"
      role="img"
      aria-label="Completions per month, last 12 months"
    >
      {data.map((d, i) => {
        const barHeight = (d.count / max) * height;
        const x = i * (barWidth + barGap);
        const y = height - barHeight;
        return (
          <g key={d.month}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, d.count > 0 ? 2 : 0)}
              rx={2}
              fill={color}
              opacity={d.count > 0 ? 1 : 0.15}
            >
              <title>
                {monthLabel(d.month)}: {d.count}
              </title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={height + 14}
              fontSize="9"
              textAnchor="middle"
              className="fill-gray-400"
            >
              {monthLabel(d.month)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
