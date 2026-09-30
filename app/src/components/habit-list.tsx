"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ListPlus, Sparkles } from "lucide-react";
import { HabitCard } from "@/components/habit-card";
import { HabitChecklistRow } from "@/components/habit-checklist-row";
import { HabitCompactRow } from "@/components/habit-compact-row";
import { ViewSwitcher, type OverviewView } from "@/components/view-switcher";
import { Dialog } from "@/components/dialog";
import { HabitForm } from "@/components/habit-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { queueLogRequest } from "@/lib/offline-queue";

export type HabitData = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  type: "build" | "quit";
  goalType: "daily" | "weekly" | "monthly";
  goalCount: number;
  isNumeric: boolean;
  targetCount: number;
  unitLabel: string | null;
  logDates: string[];
  logValues: Record<string, number>;
};

export function HabitList({
  initialHabits,
  initialArchivedHabits = [],
  today,
  weekStartDay,
  initialView = "cards",
}: {
  initialHabits: HabitData[];
  initialArchivedHabits?: HabitData[];
  today: string;
  weekStartDay: number;
  initialView?: OverviewView;
}) {
  const [habits, setHabits] = useState(initialHabits);
  const [archivedHabits, setArchivedHabits] = useState(initialArchivedHabits);
  const [showArchived, setShowArchived] = useState(false);
  const [view, setView] = useState<OverviewView>(initialView);
  const [dragId, setDragId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addPending, setAddPending] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPending, setEditPending] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const editingHabit = useMemo(
    () => habits.find((h) => h.id === editingId) ?? null,
    [habits, editingId],
  );

  const doneToday = useMemo(
    () =>
      habits.filter((h) =>
        h.isNumeric
          ? (h.logValues[today] ?? 0) >= h.targetCount
          : h.logDates.includes(today),
      ).length,
    [habits, today],
  );

  function handleViewChange(next: OverviewView) {
    setView(next);
    fetch("/api/user/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultView: next }),
    }).catch(() => {});
  }

  async function handleCreate(values: {
    name: string;
    color: string;
    icon: string | null;
    type: "build" | "quit";
    goalType: "daily" | "weekly" | "monthly";
    goalCount: number;
    isNumeric: boolean;
    targetCount: number;
    unitLabel: string;
  }) {
    setAddPending(true);
    setAddError(null);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        setAddError("Couldn't create habit. Try again.");
        return;
      }
      const { habit } = await res.json();
      setHabits((prev) => [
        ...prev,
        {
          id: habit.id,
          name: habit.name,
          color: habit.color,
          icon: habit.icon,
          type: habit.type,
          goalType: habit.goalType,
          goalCount: habit.goalCount,
          isNumeric: habit.isNumeric,
          targetCount: habit.targetCount,
          unitLabel: habit.unitLabel,
          logDates: [],
          logValues: {},
        },
      ]);
      setAddOpen(false);
    } catch {
      setAddError("Couldn't create habit. Try again.");
    } finally {
      setAddPending(false);
    }
  }

  async function handleEdit(values: {
    name: string;
    color: string;
    icon: string | null;
    type?: "build" | "quit";
    goalType?: "daily" | "weekly" | "monthly";
    goalCount?: number;
    isNumeric?: boolean;
    targetCount?: number;
    unitLabel?: string;
  }) {
    if (!editingId) return;
    setEditPending(true);
    const prevHabits = habits;
    setHabits((prev) =>
      prev.map((h) => (h.id === editingId ? { ...h, ...values } : h)),
    );
    try {
      const res = await fetch(`/api/habits/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        setHabits(prevHabits);
        return;
      }
      setEditingId(null);
    } catch {
      setHabits(prevHabits);
    } finally {
      setEditPending(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    setDeletePending(true);
    const prevHabits = habits;
    setHabits((prev) => prev.filter((h) => h.id !== deletingId));
    try {
      const res = await fetch(`/api/habits/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setHabits(prevHabits);
        return;
      }
      setDeletingId(null);
    } catch {
      setHabits(prevHabits);
    } finally {
      setDeletePending(false);
    }
  }

  async function handleArchive(habitId: string) {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setArchivedHabits((prev) => [habit, ...prev]);
    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setArchivedHabits((prev) => prev.filter((h) => h.id !== habitId));
      setHabits((prev) => [...prev, habit]);
    }
  }

  async function handleRestore(habitId: string) {
    const habit = archivedHabits.find((h) => h.id === habitId);
    if (!habit) return;
    setArchivedHabits((prev) => prev.filter((h) => h.id !== habitId));
    setHabits((prev) => [...prev, habit]);
    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: false }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      setArchivedHabits((prev) => [...prev, habit]);
    }
  }

  async function handleDuplicate(habitId: string) {
    try {
      const res = await fetch(`/api/habits/${habitId}/duplicate`, {
        method: "POST",
      });
      if (!res.ok) return;
      const { habit } = await res.json();
      setHabits((prev) => [
        ...prev,
        {
          id: habit.id,
          name: habit.name,
          color: habit.color,
          icon: habit.icon,
          type: habit.type,
          goalType: habit.goalType,
          goalCount: habit.goalCount,
          isNumeric: habit.isNumeric,
          targetCount: habit.targetCount,
          unitLabel: habit.unitLabel,
          logDates: [],
          logValues: {},
        },
      ]);
    } catch {
      // Silently ignore — user can retry.
    }
  }

  function persistOrder(ordered: HabitData[]) {
    fetch("/api/habits/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ordered.map((h) => h.id) }),
    }).catch(() => {});
  }

  // Keyboard-accessible reorder alternative to drag-and-drop (5.4).
  function moveHabit(habitId: string, direction: -1 | 1) {
    setHabits((prev) => {
      const index = prev.findIndex((h) => h.id === habitId);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      persistOrder(next);
      return next;
    });
  }

  function handleDragStart(habitId: string) {
    setDragId(habitId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    setHabits((prev) => {
      const from = prev.findIndex((h) => h.id === dragId);
      const to = prev.findIndex((h) => h.id === targetId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      persistOrder(next);
      return next;
    });
    setDragId(null);
  }

  async function handleToggleToday(habitId: string) {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    const isLogged = habit.logDates.includes(today);

    // Optimistic update.
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? {
              ...h,
              logDates: isLogged
                ? h.logDates.filter((d) => d !== today)
                : [...h.logDates, today],
            }
          : h,
      ),
    );

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      // Offline: queue for later sync instead of rolling back — the user
      // still sees the log as done, and it syncs once reconnected.
      await queueLogRequest({
        habitId,
        date: today,
        method: isLogged ? "DELETE" : "PUT",
      });
      return;
    }

    try {
      const res = await fetch(
        `/api/habits/${habitId}/logs/${encodeURIComponent(today)}`,
        { method: isLogged ? "DELETE" : "PUT" },
      );
      if (!res.ok) throw new Error("failed");
    } catch {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await queueLogRequest({
          habitId,
          date: today,
          method: isLogged ? "DELETE" : "PUT",
        });
        return;
      }
      // Rollback on failure.
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? {
                ...h,
                logDates: isLogged
                  ? [...h.logDates, today]
                  : h.logDates.filter((d) => d !== today),
              }
            : h,
        ),
      );
    }
  }

  async function handleSetValue(habitId: string, value: number) {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    const prevLogDates = habit.logDates;
    const prevLogValues = habit.logValues;

    // Optimistic update.
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? {
              ...h,
              logDates: value > 0
                ? Array.from(new Set([...h.logDates, today]))
                : h.logDates.filter((d) => d !== today),
              logValues:
                value > 0
                  ? { ...h.logValues, [today]: value }
                  : Object.fromEntries(
                      Object.entries(h.logValues).filter(([d]) => d !== today),
                    ),
            }
          : h,
      ),
    );

    const queueOffline = async () => {
      await queueLogRequest({
        habitId,
        date: today,
        method: value > 0 ? "PUT" : "DELETE",
        body: value > 0 ? { value } : undefined,
      });
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await queueOffline();
      return;
    }

    try {
      const res =
        value > 0
          ? await fetch(
              `/api/habits/${habitId}/logs/${encodeURIComponent(today)}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value }),
              },
            )
          : await fetch(
              `/api/habits/${habitId}/logs/${encodeURIComponent(today)}`,
              { method: "DELETE" },
            );
      if (!res.ok) throw new Error("failed");
    } catch {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await queueOffline();
        return;
      }
      // Rollback on failure.
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? { ...h, logDates: prevLogDates, logValues: prevLogValues }
            : h,
        ),
      );
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Your habits</h1>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          <ListPlus className="h-4 w-4" aria-hidden />
          Add habit
        </button>
      </div>

      {habits.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-500">
            {doneToday} of {habits.length} habits done today
          </p>
          <ViewSwitcher view={view} onChange={handleViewChange} />
        </div>
      )}

      {habits.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
          <Sparkles className="h-8 w-8 text-gray-400" aria-hidden />
          <p className="text-gray-500">
            No habits yet. Create your first one to start your streak.
          </p>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            <ListPlus className="h-4 w-4" aria-hidden />
            Add habit
          </button>
        </div>
      ) : view === "checklist" ? (
        <div className="flex flex-col gap-2">
          {habits.map((habit) => (
            <HabitChecklistRow
              key={habit.id}
              id={habit.id}
              name={habit.name}
              color={habit.color}
              icon={habit.icon}
              isNumeric={habit.isNumeric}
              targetCount={habit.targetCount}
              unitLabel={habit.unitLabel}
              logValue={habit.logValues[today] ?? 0}
              isLoggedToday={habit.logDates.includes(today)}
              onToggleToday={() => handleToggleToday(habit.id)}
              onSetValue={(value) => handleSetValue(habit.id, value)}
              onOpen={() => setEditingId(habit.id)}
            />
          ))}
        </div>
      ) : view === "compact" ? (
        <div className="flex flex-col gap-2">
          {habits.map((habit) => (
            <HabitCompactRow
              key={habit.id}
              name={habit.name}
              color={habit.color}
              icon={habit.icon}
              logDates={new Set(habit.logDates)}
              today={today}
              isLoggedToday={habit.logDates.includes(today)}
              onToggleToday={() => handleToggleToday(habit.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {habits.map((habit, index) => (
            <HabitCard
              key={habit.id}
              id={habit.id}
              name={habit.name}
              color={habit.color}
              icon={habit.icon}
              type={habit.type}
              goalType={habit.goalType}
              goalCount={habit.goalCount}
              isNumeric={habit.isNumeric}
              targetCount={habit.targetCount}
              unitLabel={habit.unitLabel}
              logDates={new Set(habit.logDates)}
              logValue={habit.logValues[today] ?? 0}
              today={today}
              weekStartDay={weekStartDay}
              isLoggedToday={habit.logDates.includes(today)}
              draggable
              canMoveUp={index > 0}
              canMoveDown={index < habits.length - 1}
              onToggleToday={() => handleToggleToday(habit.id)}
              onSetValue={(value) => handleSetValue(habit.id, value)}
              onEdit={() => setEditingId(habit.id)}
              onDelete={() => setDeletingId(habit.id)}
              onArchive={() => handleArchive(habit.id)}
              onDuplicate={() => handleDuplicate(habit.id)}
              onMoveUp={() => moveHabit(habit.id, -1)}
              onMoveDown={() => moveHabit(habit.id, 1)}
              onDragStart={() => handleDragStart(habit.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(habit.id)}
              onDragEnd={() => setDragId(null)}
            />
          ))}
        </div>
      )}

      {archivedHabits.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
          >
            {showArchived ? (
              <ChevronDown className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronRight className="h-4 w-4" aria-hidden />
            )}
            Archived ({archivedHabits.length})
          </button>
          {showArchived && (
            <div className="flex flex-col gap-2">
              {archivedHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 dark:border-gray-800"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full opacity-60"
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-gray-500">
                    {habit.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRestore(habit.id)}
                    className="shrink-0 rounded-md px-3 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={addOpen} title="Add habit" onClose={() => setAddOpen(false)}>
        {addError && (
          <p className="mb-3 text-sm text-red-600">{addError}</p>
        )}
        <HabitForm
          submitLabel="Add habit"
          pending={addPending}
          showType
          onSubmit={handleCreate}
          onCancel={() => setAddOpen(false)}
        />
      </Dialog>

      <Dialog
        open={editingHabit !== null}
        title="Edit habit"
        onClose={() => setEditingId(null)}
      >
        {editingHabit && (
          <HabitForm
            initialName={editingHabit.name}
            initialColor={editingHabit.color}
            initialIcon={editingHabit.icon}
            initialType={editingHabit.type}
            initialGoalType={editingHabit.goalType}
            initialGoalCount={editingHabit.goalCount}
            initialIsNumeric={editingHabit.isNumeric}
            initialTargetCount={editingHabit.targetCount}
            initialUnitLabel={editingHabit.unitLabel ?? ""}
            submitLabel="Save"
            pending={editPending}
            showType
            onSubmit={handleEdit}
            onCancel={() => setEditingId(null)}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete habit"
        description="This permanently deletes the habit and all of its logged days. This can't be undone."
        confirmLabel="Delete"
        pending={deletePending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
