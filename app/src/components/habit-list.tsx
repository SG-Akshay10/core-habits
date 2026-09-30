"use client";

import { useMemo, useState } from "react";
import { HabitCard } from "@/components/habit-card";
import { Dialog } from "@/components/dialog";
import { HabitForm } from "@/components/habit-form";
import { ConfirmDialog } from "@/components/confirm-dialog";

export type HabitData = {
  id: string;
  name: string;
  color: string;
  type: "build" | "quit";
  logDates: string[];
};

export function HabitList({
  initialHabits,
  today,
}: {
  initialHabits: HabitData[];
  today: string;
}) {
  const [habits, setHabits] = useState(initialHabits);
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

  async function handleCreate(values: {
    name: string;
    color: string;
    type: "build" | "quit";
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
          type: habit.type,
          logDates: [],
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
    type?: "build" | "quit";
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

    try {
      const res = await fetch(
        `/api/habits/${habitId}/logs/${encodeURIComponent(today)}`,
        { method: isLogged ? "DELETE" : "PUT" },
      );
      if (!res.ok) throw new Error("failed");
    } catch {
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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your habits</h1>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900"
        >
          Add habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <p className="text-gray-500">
            No habits yet. Create your first one to start your streak.
          </p>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900"
          >
            Add habit
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              id={habit.id}
              name={habit.name}
              color={habit.color}
              type={habit.type}
              logDates={new Set(habit.logDates)}
              today={today}
              isLoggedToday={habit.logDates.includes(today)}
              onToggleToday={() => handleToggleToday(habit.id)}
              onEdit={() => setEditingId(habit.id)}
              onDelete={() => setDeletingId(habit.id)}
            />
          ))}
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
            initialType={editingHabit.type}
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
