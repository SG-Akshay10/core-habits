import { buildGridDates } from "@/lib/date";

type ConsoleHabit = {
  logDates: string[];
  goalType: "daily" | "weekly" | "monthly";
  goalCount: number;
};

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function dayBefore(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day - 1));
  return value.toISOString().slice(0, 10);
}

function calculateRun(dates: Set<string>, today: string) {
  let run = 0;
  let cursor = dates.has(today) ? today : dayBefore(today);
  while (dates.has(cursor)) {
    run++;
    cursor = dayBefore(cursor);
  }
  return run;
}

export function DashboardConsole({
  today,
  habits,
  bestStreak,
  activeHabits,
  totalCheckIns,
}: {
  today: string;
  habits: ConsoleHabit[];
  bestStreak: number;
  activeHabits: number;
  totalCheckIns: number;
}) {
  const [yearText] = today.split("-");
  const year = Number(yearText);
  const firstDay = `${year}-01-01`;
  const lastDay = `${year}-12-31`;
  const columns = buildGridDates(lastDay, 53);
  const allDates = new Set(habits.flatMap((habit) => habit.logDates));
  const datesThisYear = new Set([...allDates].filter((date) => date >= firstDay && date <= today));
  const daysElapsed = Math.max(1, Math.ceil((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${firstDay}T00:00:00Z`)) / 86400000) + 1);
  const elapsedMonths = Number(today.slice(5, 7));
  const possibleLogs = habits.reduce((sum, habit) => {
    const periods = habit.goalType === "daily" ? daysElapsed : habit.goalType === "weekly" ? Math.ceil(daysElapsed / 7) : elapsedMonths;
    return sum + periods * habit.goalCount;
  }, 0);
  const loggedThisYear = habits.reduce((sum, habit) => sum + habit.logDates.filter((date) => date >= firstDay && date <= today).length, 0);
  const rate = possibleLogs ? Math.round((loggedThisYear / possibleLogs) * 100) : 0;
  const todayCount = habits.filter((habit) => habit.logDates.includes(today)).length;
  const run = calculateRun(datesThisYear, today);
  const weeklyCounts = columns.map((column) => column.filter((date) => date <= today && allDates.has(date)).length);
  const peakWeek = Math.max(0, ...weeklyCounts);
  const monthMarkers = columns.map((column, index) => {
    const inYear = column.find((date) => date.startsWith(`${yearText}-`));
    const previousInYear = index
      ? columns[index - 1].find((date) => date.startsWith(`${yearText}-`))
      : undefined;
    if (!inYear) return "";
    const month = Number(inYear.slice(5, 7)) - 1;
    const previousMonth = previousInYear ? Number(previousInYear.slice(5, 7)) - 1 : -1;
    return month !== previousMonth ? MONTHS[month] : "";
  });

  return (
    <section className="console-overview" aria-label="Yearly habit overview">
      <div className="console-heading">
        <div>
          <p className="console-eyebrow"><i /> PERSONAL TELEMETRY · YEAR VIEW</p>
          <h1>Year in tiles <span>· {year}</span></h1>
          <p className="console-subtitle">Every day is one tile. Unlit days are information, not a verdict.</p>
        </div>
        <div className="console-year-tag">{year} <span>LOCAL TIME</span></div>
      </div>

      <div className="console-stats">
        <article className="console-stat">
          <span className="console-label">YEAR FILL RATE</span>
          <div><strong className="amber">{rate}%</strong><small>{loggedThisYear} / {possibleLogs} target logs</small></div>
          <div className="console-meter"><span style={{ width: `${rate}%` }} /></div>
        </article>
        <article className="console-stat">
          <span className="console-label">CURRENT RUN</span>
          <div><strong className="amber">{run}</strong><small>days in a row</small></div>
          <p className="console-note">■ Best individual streak: {bestStreak} days</p>
        </article>
        <article className="console-stat">
          <span className="console-label">PEAK WEEK</span>
          <div><strong className="green">{peakWeek}<small className="suffix"> / {habits.length * 7}</small></strong><small>check-ins recorded</small></div>
          <p className="console-note">■ {totalCheckIns.toLocaleString()} check-ins all time</p>
        </article>
        <article className="console-stat">
          <span className="console-label">TODAY</span>
          <div><strong className="cyan">{todayCount}<small className="suffix"> / {habits.length}</small></strong><small>habits logged</small></div>
          <p className="console-note">■ {activeHabits} active in the past 7 days</p>
        </article>
      </div>

      <div className="aggregate-panel">
        <div className="aggregate-title-row">
          <h2><i /> Aggregate console <span>ALL HABITS · {year}</span></h2>
          <div className="console-legend"><span>Less</span><i /><i /><i /><i /><span>More</span></div>
        </div>
        <div className="aggregate-grid">
          <div className="aggregate-months"><span />{monthMarkers.map((month, index) => <span key={index}>{month}</span>)}</div>
          <div className="aggregate-cells">
            <div className="aggregate-weekdays">{["", "M", "", "W", "", "F", "S"].map((label, i) => <span key={i}>{label}</span>)}</div>
            {columns.map((column, columnIndex) => (
              <div className="aggregate-week" key={columnIndex}>
                {column.map((date, dayIndex) => {
                  const count = allDates.has(date) ? habits.filter((habit) => habit.logDates.includes(date)).length : 0;
                  const future = date > today || !date.startsWith(`${yearText}-`);
                  const level = !count ? 0 : Math.min(4, Math.ceil((count / Math.max(1, habits.length)) * 4));
                  return <span key={date} className={`aggregate-cell level-${level}${future ? " is-future" : ""}${date === today ? " is-today" : ""}`} title={`${date}: ${count} of ${habits.length} logged`} aria-label={`${date}: ${count} habits logged`} data-row={dayIndex} />;
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="aggregate-caption"><span>ⓘ One column per week · today is marked in place</span><span>NO STREAK PENALTIES · NO SHAME MECHANICS</span></div>
      </div>
    </section>
  );
}
