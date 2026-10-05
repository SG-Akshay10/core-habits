"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { type Theme, applyTheme } from "@/lib/theme";
import type { OverviewView } from "@/components/view-switcher";

type ImportPreview = {
  habitsToCreate: number;
  habitsToMerge: number;
  logsToAdd: number;
  logsSkippedAsDuplicates: number;
  habits: {
    name: string;
    action: "create" | "merge";
    newLogs: number;
    skippedLogs: number;
  }[];
};

export default function SettingsPage() {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [weekStartDay, setWeekStartDay] = useState<number | null>(null);
  const [savingWeekStart, setSavingWeekStart] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [defaultView, setDefaultView] = useState<OverviewView>("cards");
  const [importPayload, setImportPayload] = useState<unknown>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(
    null,
  );
  const [importError, setImportError] = useState<string | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importDone, setImportDone] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user/settings")
      .then((res) => res.json())
      .then((data) => {
        setWeekStartDay(data.weekStartDay ?? 0);
        setTheme(data.theme === "dark" ? "dark" : "light");
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

  function handleExport(format: "json" | "csv") {
    const a = document.createElement("a");
    a.href = `/api/export?format=${format}`;
    a.click();
  }

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportPreview(null);
    setImportDone(null);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      setImportPayload(payload);
      setImportBusy(true);
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, mode: "preview" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error ?? "Invalid import file");
        return;
      }
      setImportPreview(data.preview);
    } catch {
      setImportError("Couldn't read that file — is it a valid export?");
    } finally {
      setImportBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleConfirmImport() {
    if (!importPayload) return;
    setImportBusy(true);
    setImportError(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: importPayload, mode: "apply" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error ?? "Import failed");
        return;
      }
      setImportDone(
        `Imported ${data.result.habitsCreated} new habit(s), merged ${data.result.habitsMerged}, added ${data.result.logsAdded} log(s).`,
      );
      setImportPreview(null);
      setImportPayload(null);
    } catch {
      setImportError("Import failed — please try again.");
    } finally {
      setImportBusy(false);
    }
  }

  function cancelImport() {
    setImportPreview(null);
    setImportPayload(null);
    setImportError(null);
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="mt-10 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="font-medium">Appearance</h2>
        <p className="mt-2 text-sm text-gray-500">
          Choose a light or dark appearance.
        </p>
        <div className="mt-4 flex gap-2">
          {(
            [
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
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


      <section className="mt-6 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="font-medium">Your data</h2>
        <p className="mt-2 text-sm text-gray-500">
          Export all your habits and logs, or import a previous export.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleExport("json")}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => handleExport("csv")}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Export CSV
          </button>
          <label className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer dark:border-gray-700 dark:hover:bg-gray-800">
            Import JSON…
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChosen}
              className="hidden"
            />
          </label>
        </div>

        {importBusy && (
          <p className="mt-3 text-sm text-gray-500">Working…</p>
        )}
        {importError && (
          <p className="mt-3 text-sm text-red-600">{importError}</p>
        )}
        {importDone && (
          <p className="mt-3 text-sm text-green-600">{importDone}</p>
        )}

        {importPreview && (
          <div className="mt-4 rounded-md border border-gray-200 p-4 text-sm dark:border-gray-800">
            <p>
              {importPreview.habitsToCreate} new habit(s),{" "}
              {importPreview.habitsToMerge} to merge,{" "}
              {importPreview.logsToAdd} new log(s) (
              {importPreview.logsSkippedAsDuplicates} duplicates skipped).
            </p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-gray-500">
              {importPreview.habits.map((h) => (
                <li key={h.name}>
                  {h.action === "create" ? "＋" : "⇄"} {h.name} —{" "}
                  {h.newLogs} new log(s)
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importBusy}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
              >
                Confirm import
              </button>
              <button
                type="button"
                onClick={cancelImport}
                className="rounded-md px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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
