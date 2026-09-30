"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type Theme, applyTheme } from "@/lib/theme";
import type { OverviewView } from "@/components/view-switcher";

export default function SettingsPage() {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [weekStartDay, setWeekStartDay] = useState<number | null>(null);
  const [savingWeekStart, setSavingWeekStart] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const [defaultView, setDefaultView] = useState<OverviewView>("cards");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user/settings")
      .then((res) => res.json())
      .then((data) => {
        setWeekStartDay(data.weekStartDay ?? 0);
        setTheme(data.theme ?? "system");
        setDefaultView(data.defaultView ?? "cards");
      })
      .catch(() => setWeekStartDay(0));
  }, []);

  async function handleWeekStartChange(value: number) {
    setWeekStartDay(value);
    setSavingWeekStart(true);
    try {
      await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStartDay: value }),
      });
    } finally {
      setSavingWeekStart(false);
    }
  }

  function handleThemeChange(next: Theme) {
    setTheme(next);
    applyTheme(next);
    fetch("/api/user/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: next }),
    }).catch(() => {});
  }

  function handleDefaultViewChange(next: OverviewView) {
    setDefaultView(next);
    fetch("/api/user/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultView: next }),
    }).catch(() => {});
  }

  async function handleDelete() {
    setPending(true);
    const res = await fetch("/api/user/delete", { method: "POST" });
    setPending(false);
    if (res.ok) {
      router.push("/");
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="mt-10 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="font-medium">Appearance</h2>
        <p className="mt-2 text-sm text-gray-500">
          Choose light, dark, or follow your system setting.
        </p>
        <div className="mt-4 flex gap-2">
          {(
            [
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={theme === opt.value}
              onClick={() => handleThemeChange(opt.value)}
              className={`rounded-md border px-4 py-2 text-sm ${
                theme === opt.value
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="font-medium">Default dashboard view</h2>
        <p className="mt-2 text-sm text-gray-500">
          How your habits are displayed on the dashboard.
        </p>
        <div className="mt-4 flex gap-2">
          {(
            [
              { value: "cards", label: "Cards" },
              { value: "checklist", label: "Checklist" },
              { value: "compact", label: "Compact" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={defaultView === opt.value}
              onClick={() => handleDefaultViewChange(opt.value)}
              className={`rounded-md border px-4 py-2 text-sm ${
                defaultView === opt.value
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="font-medium">Week start day</h2>
        <p className="mt-2 text-sm text-gray-500">
          Used for weekly goal progress and week streaks.
        </p>
        <div className="mt-4 flex gap-2">
          {[
            { value: 0, label: "Sunday" },
            { value: 1, label: "Monday" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={weekStartDay === null || savingWeekStart}
              aria-pressed={weekStartDay === opt.value}
              onClick={() => handleWeekStartChange(opt.value)}
              className={`rounded-md border px-4 py-2 text-sm ${
                weekStartDay === opt.value
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>


      <section className="mt-6 rounded-lg border border-red-200 p-6 dark:border-red-900">
        <h2 className="font-medium text-red-600">Delete account</h2>
        <p className="mt-2 text-sm text-gray-500">
          This permanently deletes your account and all associated data. This
          cannot be undone.
        </p>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="mt-4 rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Delete my account
          </button>
        ) : (
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleDelete}
              disabled={pending}
              className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? "Deleting…" : "Yes, permanently delete"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-md px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
