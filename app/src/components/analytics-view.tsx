"use client";

import Link from "next/link";
import { ArrowDownToLine, Flame, Layers3, CalendarDays, Activity } from "lucide-react";
import { getHabitIcon } from "@/lib/icons";
import type { AnalyticsData } from "@/lib/analytics";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function Metric({ label, value, suffix, accent, note, icon: Icon }: {
  label: string;
  value: string | number;
  suffix?: string;
  accent?: string;
  note: string;
  icon: typeof Flame;
}) {
  return (
    <section className="analytics-metric">
      <div className="analytics-metric-top"><span>{label}</span><Icon size={16} aria-hidden /></div>
      <div className={`analytics-metric-value ${accent ?? ""}`}>{value}<small>{suffix}</small></div>
      <p>{note}</p>
    </section>
  );
}

function MonthlyVolume({ data }: { data: AnalyticsData["monthlyVolume"] }) {
  const max = Math.max(1, ...data.map((month) => month.total));
  const colors = [...new Map(data.flatMap((month) => month.byHabit.map((habit) => [habit.id, habit.color] as const))).entries()];
  return (
    <section className="analytics-panel analytics-volume">
      <div className="analytics-panel-heading">
        <div><h2>Monthly habit volume</h2><p>Completed targets by month, split by habit.</p></div>
        <div className="analytics-legend" aria-label="Habit colors">
          {colors.slice(0, 4).map(([id, color]) => {
            const habit = data.flatMap((month) => month.byHabit).find((item) => item.id === id);
            return <span key={id}><i style={{ backgroundColor: color }} />{habit?.name}</span>;
          })}
          {colors.length > 4 && <span>+{colors.length - 4} more</span>}
        </div>
      </div>
      {data.every((month) => month.total === 0) ? (
        <div className="analytics-empty">Your monthly activity will appear here as you log habits.</div>
      ) : (
        <div className="analytics-bars" aria-label="Monthly completed habit targets">
          {data.map((month) => (
            <div className="analytics-bar-column" key={month.month}>
              <span className="analytics-bar-total">{month.total || ""}</span>
              <div className="analytics-bar-track" title={`${month.label} ${month.month.slice(0, 4)}: ${month.total} completions`}>
                {month.byHabit.map((habit) => habit.count > 0 && (
                  <span key={habit.id} style={{ height: `${(habit.count / max) * 100}%`, backgroundColor: habit.color }} />
                ))}
              </div>
              <span className="analytics-month-label">{month.label}</span>
            </div>
          ))}
        </div>
      )}
      <div className="analytics-panel-foot"><span>12 MONTH WINDOW</span><span>Peak month: {data.reduce((best, month) => month.total > best.total ? month : best, data[0])?.label ?? "—"}</span></div>
    </section>
  );
}

function WeeklyCadence({ data }: { data: AnalyticsData["weeklyRhythm"] }) {
  return (
    <section className="analytics-panel analytics-cadence">
      <div className="analytics-panel-heading"><div><h2>Weekly cadence</h2><p>Share of available habit targets completed by day.</p></div><span className="analytics-micro-tag">BY DAY</span></div>
      <div className="analytics-cadence-list">
        {data.map(({ day, count, rate }) => (
          <div className="analytics-cadence-row" key={day}>
            <span>{DAYS[day]}</span><div className="analytics-cadence-track"><i style={{ width: `${Math.round(rate * 100)}%` }} /></div>
            <strong>{Math.round(rate * 100)}%</strong><small>{count}</small>
          </div>
        ))}
      </div>
      <div className="analytics-cadence-note">Cadence reflects the last 90 days, adjusted for habits created during that period.</div>
    </section>
  );
}

function HabitDeepDive({ data }: { data: AnalyticsData["habits"][number] }) {
  const Icon = getHabitIcon(data.icon);
  const frequency = data.goalType === "weekly" ? `${data.goalCount}× / WK` : data.goalType === "monthly" ? `${data.goalCount}× / MO` : "DAILY";
  return (
    <Link href={`/habits/${data.id}`} className="analytics-habit-card">
      <div className="analytics-habit-heading">
        <span className="analytics-habit-icon" style={{ color: data.color, backgroundColor: `${data.color}20` }}>
          {Icon ? <Icon size={17} aria-hidden /> : <i style={{ backgroundColor: data.color }} />}
        </span>
        <div><h3>{data.name}</h3><p>{data.isNumeric ? `Numeric target${data.unitLabel ? ` · ${data.unitLabel}` : ""}` : "Completion history"}</p></div>
        <span className="analytics-frequency" style={{ color: data.color }}>{frequency}</span>
      </div>
      <div className="analytics-habit-stats">
        <div><span>BEST STREAK</span><strong>{data.longestStreak}<small> days</small></strong></div>
        <div><span>CURRENT STREAK</span><strong style={{ color: data.color }}>{data.currentStreak}<small> days</small></strong></div>
        <div><span>TOTAL OUTPUT</span><strong>{data.totalOutput.toLocaleString()}<small> {data.isNumeric ? data.unitLabel ?? "units" : "logs"}</small></strong></div>
        <div><span>TARGET RATE</span><strong style={{ color: data.color }}>{Math.round(data.completionRate * 100)}%</strong></div>
      </div>
      <div className="analytics-habit-foot"><span>{data.recentCompletions} completed in 90 days</span><span>{data.totalCompletions} total</span></div>
    </Link>
  );
}

export function AnalyticsView({ data }: { data: AnalyticsData }) {
  const bestHabit = [...data.habits].sort((a, b) => b.currentStreak - a.currentStreak)[0];
  return (
    <main className="analytics-view">
      <section className="analytics-hero">
        <div><p className="analytics-eyebrow"><i /> TELEMETRY MODE <b>{"//"}</b> AGGREGATED STATS</p>
          <h1>Analytics <span>&amp; Streaks</span></h1>
          <p className="analytics-subtitle">Completions, consistency, and personal records, charted month by month.</p>
        </div>
        <div className="analytics-hero-controls"><span>TRAILING 90D</span><a href="/api/export" download><ArrowDownToLine size={14} /> EXPORT</a></div>
      </section>

      <section className="analytics-metrics" aria-label="Habit analytics summary">
        <Metric label="ACTIVE HABITS" value={data.activeHabits} suffix=" monitored" note={`${data.habits.length} total active protocols`} icon={Layers3} />
        <Metric label="OVERALL CONSISTENCY" value={`${Math.round(data.averageDailyScore * 100)}%`} accent="is-green" note="Target completions · trailing 90 days" icon={Activity} />
        <Metric label="LONGEST ACTIVE STREAK" value={bestHabit?.currentStreak ?? 0} suffix=" days" accent="is-amber" note={bestHabit ? `Current leader · ${bestHabit.name}` : "Log a habit to start a streak"} icon={Flame} />
        <Metric label={`DAYS LOGGED (${data.year})`} value={data.totalDaysLogged} suffix=" days" note={`${data.totalCheckIns.toLocaleString()} completed targets all time`} icon={CalendarDays} />
      </section>

      <section className="analytics-charts"><MonthlyVolume data={data.monthlyVolume} /><WeeklyCadence data={data.weeklyRhythm} /></section>

      <section className="analytics-deep-dives">
        <div className="analytics-section-heading"><div><h2>Habit deep dives</h2><p>Streak records, target rates, and cumulative output for each habit.</p></div><span>{data.habits.length} {data.habits.length === 1 ? "PROTOCOL" : "PROTOCOLS"}</span></div>
        {data.habits.length ? <div className="analytics-habit-grid">{data.habits.map((habit) => <HabitDeepDive key={habit.id} data={habit} />)}</div> : <div className="analytics-empty">No active habits yet. Add a habit on your dashboard to start building your record.</div>}
      </section>
      <footer className="analytics-footer"><span><i /> TELEMETRY OPERATIONAL</span><span>PRIVATE BY DEFAULT · ABSENCE IS JUST AN UNLIT NODE</span><Link href="/dashboard">OPEN DASHBOARD ↗</Link></footer>
    </main>
  );
}
