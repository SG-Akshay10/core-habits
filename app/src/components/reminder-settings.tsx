"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { subscribeToPush } from "@/lib/push-client";

type Reminder = {
  id: string;
  time: string;
  daysOfWeek: number[];
  enabled: boolean;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ReminderSettings({ habitId }: { habitId: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("09:00");
  const [days, setDays] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5, 6]));
  const [pending, setPending] = useState(false);
  const [notifStatus, setNotifStatus] = useState<
    NotificationPermission | "unsupported"
  >(() => {
    if (typeof window === "undefined") return "default";
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission;
  });

  useEffect(() => {
    fetch(`/api/habits/${habitId}/reminders`)
      .then((res) => res.json())
      .then((data) => setReminders(data.reminders ?? []))
      .finally(() => setLoading(false));
  }, [habitId]);

  function toggleDay(day: number) {
    setDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  async function handleEnableNotifications() {
    const result = await subscribeToPush();
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifStatus(Notification.permission);
    }
    if (!result.ok) {
      // Leave the UI as-is; the explainer copy below stays visible so the
      // user can retry (e.g. after changing the browser's site settings).
    }
  }

  async function handleAdd() {
    if (days.size === 0) return;
    setPending(true);
    try {
      const res = await fetch(`/api/habits/${habitId}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time, daysOfWeek: [...days].sort() }),
      });
      if (res.ok) {
        const data = await res.json();
        setReminders((prev) => [...prev, data.reminder]);
      }
    } finally {
      setPending(false);
    }
  }

  async function handleToggleEnabled(reminder: Reminder) {
    const next = !reminder.enabled;
    setReminders((prev) =>
      prev.map((r) => (r.id === reminder.id ? { ...r, enabled: next } : r)),
    );
    await fetch(`/api/habits/${habitId}/reminders/${reminder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    }).catch(() => {});
  }

  async function handleDelete(reminderId: string) {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    await fetch(`/api/habits/${habitId}/reminders/${reminderId}`, {
      method: "DELETE",
    }).catch(() => {});
  }

  return (
    <div className="flex flex-col gap-4">
      {notifStatus !== "granted" && notifStatus !== "unsupported" && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          <p className="mb-2">
            Reminders are sent as browser notifications, opt-in only. Enable
            them to get nudged at the times you pick below — no guilt, just a
            gentle tap.
          </p>
          <button
            type="button"
            onClick={handleEnableNotifications}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900"
          >
            Enable notifications
          </button>
        </div>
      )}
      {notifStatus === "unsupported" && (
        <p className="text-xs text-gray-500">
          This browser doesn&apos;t support push notifications. On iOS, add
          this app to your home screen first, then enable notifications from
          there.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {reminders.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-800"
            >
              <div className="flex flex-col">
                <span className="font-medium tabular-nums">{r.time}</span>
                <span className="text-xs text-gray-500">
                  {r.daysOfWeek.length === 7
                    ? "Every day"
                    : r.daysOfWeek.map((d) => DAY_LABELS[d]).join(", ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-pressed={r.enabled}
                  onClick={() => handleToggleEnabled(r)}
                  className={`rounded-md border px-2 py-1 text-xs ${
                    r.enabled
                      ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  {r.enabled ? "On" : "Off"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  aria-label="Delete reminder"
                  className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
          {reminders.length === 0 && (
            <p className="text-sm text-gray-500">No reminders yet.</p>
          )}
        </ul>
      )}

      <div className="flex flex-col gap-2 rounded-md border border-dashed border-gray-300 p-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <label htmlFor="reminder-time" className="text-xs text-gray-500">
            Time
          </label>
          <input
            id="reminder-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {DAY_LABELS.map((label, day) => (
            <button
              key={label}
              type="button"
              aria-pressed={days.has(day)}
              onClick={() => toggleDay(day)}
              className={`rounded-md border px-2 py-1 text-xs ${
                days.has(day)
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={pending || days.size === 0}
          className="self-start rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
        >
          Add reminder
        </button>
      </div>
    </div>
  );
}
