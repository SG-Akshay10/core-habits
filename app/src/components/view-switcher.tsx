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
    <div className="flex gap-1 rounded-md border border-gray-200 p-0.5 dark:border-gray-800">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={view === opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded px-3 py-1 text-xs font-medium ${
            view === opt.value
              ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
