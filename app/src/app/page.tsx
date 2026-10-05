import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signInWithGoogle } from "./actions";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarCheck2,
  Check,
  CheckCheck,
  ChevronRight,
  Flame,
  Goal,
  Heart,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from "lucide-react";

const routines = [
  {
    name: "Morning",
    color: "blue",
    habits: ["Wake up early", "Run", "Meditate", "Plan the day"],
  },
  {
    name: "Afternoon",
    color: "orange",
    habits: ["Healthy lunch", "Connect with a friend", "Read"],
  },
  {
    name: "Evening",
    color: "violet",
    habits: ["Reflect", "Wind down", "Prepare for tomorrow"],
  },
] as const;

const features = [
  {
    icon: CalendarCheck2,
    color: "blue",
    title: "A clear view of every day",
    description:
      "See your check-ins at a glance with a calm calendar that makes consistency easy to spot.",
  },
  {
    icon: Flame,
    color: "orange",
    title: "Momentum you can feel",
    description:
      "Keep an eye on current and longest streaks, and celebrate the progress behind them.",
  },
  {
    icon: Goal,
    color: "violet",
    title: "Goals that fit real life",
    description:
      "Set daily, weekly, or monthly targets, including countable goals like pages or glasses of water.",
  },
  {
    icon: Bell,
    color: "rose",
    title: "Gentle reminders",
    description:
      "Choose reminder times for your habits and get a nudge when it works for your routine.",
  },
  {
    icon: WifiOff,
    color: "teal",
    title: "Ready when you are",
    description:
      "Log habits offline and your check-ins will sync when you’re back online.",
  },
  {
    icon: ShieldCheck,
    color: "green",
    title: "Your data stays yours",
    description:
      "Export your habit history whenever you like, or delete your account and its data in settings.",
  },
];

function SignInButton({
  children,
  secondary = false,
}: {
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <form action={signInWithGoogle}>
      <button
        type="submit"
        className={
          secondary
            ? "inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
            : "landing-primary-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500 dark:bg-indigo-400 dark:text-slate-950 dark:hover:bg-indigo-300"
        }
      >
        {children}
      </button>
    </form>
  );
}

function ProductPreview() {
  const habitRows = [
    { icon: "☀", name: "Morning run", detail: "20 minutes", color: "bg-sky-500", checked: true },
    { icon: "◉", name: "Read a book", detail: "10 pages", color: "bg-violet-500", checked: true },
    { icon: "⌁", name: "Drink water", detail: "6 of 8 glasses", color: "bg-teal-500", checked: false },
    { icon: "♡", name: "No late scrolling", detail: "Daily", color: "bg-rose-500", checked: false },
  ];
  return (
    <div className="relative z-10 mx-auto mt-14 w-full max-w-5xl pb-8 sm:mt-20 sm:pb-14">
      <div className="absolute inset-x-[8%] top-12 h-3/4 rounded-[50%] bg-gradient-to-r from-blue-300/30 via-violet-300/40 to-fuchsia-300/30 blur-3xl dark:from-blue-600/15 dark:via-violet-600/20 dark:to-fuchsia-600/15" />
      <div className="landing-preview-frame relative mx-auto max-w-4xl rounded-[1.8rem] border border-slate-300/80 bg-slate-900 p-2 shadow-[0_32px_90px_-38px_rgba(49,46,129,.55)] sm:rounded-[2rem] sm:p-3">
        <div className="overflow-hidden rounded-[1.35rem] bg-white dark:bg-slate-950 sm:rounded-[1.5rem]">
          <div className="landing-preview-topbar flex h-9 items-center gap-1.5 border-b border-slate-100 px-4 dark:border-white/10">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <div className="ml-4 h-4 w-28 rounded-full bg-slate-100 dark:bg-white/5" />
          </div>
          <div className="landing-preview-grid grid min-h-[310px] grid-cols-[125px_1fr] sm:min-h-[380px] sm:grid-cols-[190px_1fr]">
            <aside className="landing-preview-sidebar border-r border-slate-100 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.025] sm:p-5">
              <div className="mb-8 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white">Core Habits</span>
              </div>
              <div className="space-y-2 text-[10px] font-medium text-slate-500 sm:text-xs">
                <div className="rounded-lg bg-indigo-50 px-2.5 py-2 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">▦　Today</div>
                <div className="px-2.5 py-2">◷　Progress</div>
                <div className="px-2.5 py-2">⚙　Settings</div>
              </div>
              <div className="mt-8 hidden rounded-xl bg-indigo-50/80 p-3 dark:bg-indigo-400/10 sm:block">
                <Sparkles className="mb-2 h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">Keep your rhythm</p>
                <p className="mt-1 text-[9px] leading-4 text-slate-500">Small actions, repeated with care.</p>
              </div>
            </aside>
            <div className="landing-preview-main p-4 sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-3 sm:mb-7">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.16em] text-indigo-600 dark:text-indigo-300 sm:text-[10px]">Monday · Your daily rhythm</p>
                  <h2 className="mt-1 text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">A good day starts here.</h2>
                </div>
                <div className="rounded-full bg-slate-100 px-2.5 py-1.5 text-[9px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300 sm:px-3 sm:text-[10px]">2 of 4 done</div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {habitRows.map((habit) => (
                  <div key={habit.name} className="landing-preview-row flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5 sm:gap-3 sm:p-3 dark:border-white/10">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm text-white ${habit.color}`}>{habit.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-semibold text-slate-800 dark:text-slate-100 sm:text-xs">{habit.name}</p>
                      <p className="mt-0.5 text-[9px] text-slate-400 sm:text-[10px]">{habit.detail}</p>
                    </div>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${habit.checked ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-400 dark:text-slate-950" : "border-slate-200 text-transparent dark:border-white/20"}`}><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[9px] text-slate-400 sm:mt-5 sm:text-[10px]"><Flame className="h-3.5 w-3.5 text-orange-500" /> A little consistency goes a long way.</div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-1 right-[2%] w-[31%] max-w-[190px] rounded-[1.7rem] border-[5px] border-slate-900 bg-white p-2 shadow-2xl sm:right-[1%] sm:bottom-0 sm:w-[24%] sm:max-w-[205px] sm:rounded-[2rem] sm:border-[6px] sm:p-3 dark:bg-slate-950">
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[8px] font-bold text-slate-800 dark:text-white">Core Habits</span>
          <span className="text-[8px] font-medium text-slate-400">Today · 9:41</span>
        </div>
        <p className="mb-2 text-[10px] font-bold text-slate-800 dark:text-white sm:text-xs">Your habits</p>
        <div className="space-y-1.5">
          {habitRows.slice(0, 3).map((habit) => <div key={habit.name} className="flex items-center gap-1.5 rounded-lg border border-slate-100 p-1.5 dark:border-white/10"><span className={`h-2 w-2 rounded-full ${habit.color}`} /><span className="flex-1 truncate text-[7px] text-slate-600 dark:text-slate-300">{habit.name}</span>{habit.checked && <Check className="h-2.5 w-2.5 text-indigo-600" />}</div>)}
        </div>
        <div className="mt-2 rounded-lg bg-indigo-600 py-1.5 text-center text-[7px] font-semibold text-white">+ Add a habit</div>
      </div>
    </div>
  );
}

function ProgressPreview() {
  const cells = Array.from({ length: 84 }, (_, i) => (i * 7 + Math.floor(i / 5)) % 11 > 5);
  const bars = [42, 68, 52, 86, 60, 94, 72, 100, 66, 80, 55, 92];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-5">
        <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold text-slate-800 dark:text-slate-100">Your activity</p><p className="mt-1 text-[10px] text-slate-400">A year of little wins</p></div><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">2026</span></div>
        <div className="grid grid-cols-12 gap-1 sm:gap-1.5">{cells.map((active, index) => <span key={index} className={`aspect-square rounded-[3px] ${active ? index % 4 === 0 ? "bg-indigo-300 dark:bg-indigo-700" : "bg-indigo-600 dark:bg-indigo-400" : "bg-slate-100 dark:bg-white/10"}`} />)}</div>
        <div className="mt-3 flex items-center justify-between text-[9px] text-slate-400"><span>Less</span><div className="flex gap-1"><i className="h-2 w-2 rounded-sm bg-slate-100 dark:bg-white/10"/><i className="h-2 w-2 rounded-sm bg-indigo-200 dark:bg-indigo-800"/><i className="h-2 w-2 rounded-sm bg-indigo-400"/><i className="h-2 w-2 rounded-sm bg-indigo-600 dark:bg-indigo-400"/></div><span>More</span></div>
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-5">
        <div className="mb-4"><p className="text-xs font-bold text-slate-800 dark:text-slate-100">Your progress, over time</p><p className="mt-1 text-[10px] text-slate-400">Every check-in counts</p></div>
        <div className="relative flex h-[118px] items-end gap-1 border-b border-l border-slate-100 px-2 dark:border-white/10">{bars.map((height, index) => <div key={index} className="flex h-full flex-1 items-end"><span className="w-full rounded-t-sm bg-gradient-to-t from-indigo-500 to-blue-400 opacity-90" style={{ height: `${height}%` }} /></div>)}<div className="absolute inset-x-0 top-[42%] border-t border-dashed border-emerald-400" /></div>
        <div className="mt-2 flex justify-between text-[9px] text-slate-400"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div>
      </div>
    </div>
  );
}

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="landing-page overflow-hidden bg-white text-slate-900 dark:bg-[#0d0f14] dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#0d0f14]/90">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="text-[15px] font-bold tracking-tight">Core Habits</a>
          <nav className="hidden items-center gap-7 text-[13px] font-medium text-slate-500 md:flex dark:text-slate-400" aria-label="Main navigation">
            <a className="transition hover:text-slate-900 dark:hover:text-white" href="#how-it-works">How it works</a>
            <a className="transition hover:text-slate-900 dark:hover:text-white" href="#progress">Progress</a>
            <a className="transition hover:text-slate-900 dark:hover:text-white" href="#features">Features</a>
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2"><SignInButton secondary>Sign in</SignInButton><SignInButton><span className="hidden sm:inline">Get started</span><span className="sm:hidden">Start free</span><ArrowRight className="h-4 w-4" /></SignInButton></div>
        </div>
      </header>

      <section id="top" className="relative px-5 pb-8 pt-16 text-center sm:px-8 sm:pt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 mx-auto h-[440px] max-w-4xl bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.11),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.16),transparent_68%)]" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold text-indigo-700 shadow-sm dark:border-indigo-400/20 dark:bg-white/5 dark:text-indigo-200"><Sparkles className="h-3.5 w-3.5" /> A little better, one day at a time</span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-[-.045em] text-slate-950 sm:text-6xl dark:text-white">Build better habits.<br /><span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-300 dark:via-blue-300 dark:to-violet-300">Build a better life.</span></h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg dark:text-slate-400">Make space for the routines that matter. Track your progress, find your rhythm, and keep showing up for yourself.</p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"><SignInButton>Try Core Habits free <ArrowRight className="h-4 w-4" /></SignInButton><a href="#how-it-works" className="inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">See how it works <ArrowDown className="h-4 w-4" /></a></div>
          <p className="mt-4 text-[11px] text-slate-400">Free to get started <span className="mx-1.5">·</span> Sign in securely with Google</p>
        </div>
        <ProductPreview />
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div>
            <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300"><CheckCheck className="h-5 w-5" /></span>
            <p className="text-xs font-bold uppercase tracking-[.17em] text-indigo-600 dark:text-indigo-300">Make it yours</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-.035em] sm:text-4xl">Organize your day around what matters.</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">Give your habits a place in your routine. Build a simple plan, check in as you go, and let steady progress do its work.</p>
            <a href="#features" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300">Explore the features <ChevronRight className="h-4 w-4" /></a>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200/70 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-white/10 dark:bg-white/[0.025]">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-bold">Your routine</p><p className="mt-1 text-[11px] text-slate-400">A plan that feels like you</p></div><span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500 shadow-sm dark:bg-white/10 dark:text-slate-300">Today <ChevronRight className="ml-1 inline h-3 w-3" /></span></div>
            <div className="grid gap-3 md:grid-cols-3">{routines.map((routine) => <div key={routine.name} className="rounded-2xl border border-slate-200/70 bg-white p-3 dark:border-white/10 dark:bg-slate-900"><div className={`mb-3 rounded-lg py-2 text-center text-[10px] font-bold text-white ${routine.color === "blue" ? "bg-blue-500" : routine.color === "orange" ? "bg-orange-500" : "bg-violet-500"}`}>{routine.name}</div><div className="space-y-2">{routine.habits.map((habit, index) => <div key={habit} className={`rounded-lg border px-2.5 py-2 ${routine.color === "blue" ? "border-blue-200 dark:border-blue-400/30" : routine.color === "orange" ? "border-orange-200 dark:border-orange-400/30" : "border-violet-200 dark:border-violet-400/30"}`}><p className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">{habit}</p><p className="mt-0.5 text-[8px] text-slate-400">{index === 0 ? "A small step to begin" : "Whenever it fits your day"}</p></div>)}</div></div>)}</div>
          </div>
        </div>
      </section>

      <section id="progress" className="scroll-mt-20 bg-gradient-to-b from-blue-50/70 via-violet-50/50 to-white px-5 py-20 sm:px-8 sm:py-24 dark:from-indigo-950/25 dark:via-violet-950/10 dark:to-[#0d0f14]">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto mb-10 max-w-xl text-center"><span className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300"><BarChart3 className="h-5 w-5" /></span><p className="text-xs font-bold uppercase tracking-[.17em] text-indigo-600 dark:text-indigo-300">Notice the change</p><h2 className="mt-3 text-3xl font-bold tracking-[-.035em] sm:text-4xl">Progress looks good on you.</h2><p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">A streak is more than a number. See the small choices you’ve made add up over time.</p></div>
          <ProgressPreview />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto mb-10 max-w-xl text-center"><p className="text-xs font-bold uppercase tracking-[.17em] text-indigo-600 dark:text-indigo-300">Thoughtful by design</p><h2 className="mt-3 text-3xl font-bold tracking-[-.035em] sm:text-4xl">Everything you need to keep going.</h2><p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">A focused set of tools that helps you build routines without making life more complicated.</p></div>
        <div className="grid overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-200/80 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10 dark:bg-white/10">{features.map(({ icon: Icon, color, title, description }) => <article key={title} className="bg-white p-6 sm:p-7 dark:bg-[#111319]"><span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color === "blue" ? "bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300" : color === "orange" ? "bg-orange-50 text-orange-600 dark:bg-orange-400/10 dark:text-orange-300" : color === "violet" ? "bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300" : color === "rose" ? "bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300" : color === "teal" ? "bg-teal-50 text-teal-600 dark:bg-teal-400/10 dark:text-teal-300" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300"}`}><Icon className="h-5 w-5" /></span><h3 className="mt-4 text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p></article>)}</div>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16 dark:bg-indigo-950/50 dark:ring-1 dark:ring-white/10"><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(129,140,248,.35),transparent_55%)]" /><div className="relative mx-auto max-w-xl"><span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-indigo-200"><Heart className="h-5 w-5" /></span><h2 className="mt-5 text-3xl font-bold tracking-[-.035em] sm:text-4xl">Make room for a better day.</h2><p className="mt-3 text-sm leading-6 text-slate-300">Start with one habit. See where a little consistency can take you.</p><div className="mt-7 flex justify-center"><SignInButton>Get started for free <ArrowRight className="h-4 w-4" /></SignInButton></div><p className="mt-4 text-[10px] text-slate-400">No complicated setup. Sign in securely with Google.</p></div></div>
      </section>

      <footer className="border-t border-slate-200/80 bg-slate-50/70 px-5 py-8 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row sm:px-3"><a href="#top" className="text-xs font-bold">Core Habits</a><p className="text-[10px] text-slate-400">Build a life, one small promise at a time.</p><nav className="flex items-center gap-5 text-[11px] text-slate-500 dark:text-slate-400" aria-label="Legal"><a className="hover:text-slate-900 dark:hover:text-white" href="/terms">Terms</a><a className="hover:text-slate-900 dark:hover:text-white" href="/privacy">Privacy</a></nav></div>
      </footer>
    </main>
  );
}
