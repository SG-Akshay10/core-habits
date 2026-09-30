"use client";

export type OverviewView = "cards" | "checklist" | "compact";

const OPTIONS: { value: OverviewView; label: string }[] = [
  { value: "cards", label: "Cards" },
  { value: "checklist", label: "Checklist" },
  { value: "compact", label: "Compact" },
];

/** Overview layout switcher (5.3), remembered per user. */
export function ViewSwitcher({
  view,
  onChange,
}: {
  view: OverviewView;
  onChange: (view: OverviewView) => void;
}) {
  return (
    <div className="flex gap-1 rounded-full bg-gray-100 p-1 dark:bg-white/5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={view === opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            view === opt.value
              ? "bg-[var(--surface)] text-gray-900 shadow-sm dark:text-white"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
