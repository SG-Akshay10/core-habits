import { CheckCheck, BarChart3 } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Theme } from "@/lib/theme";

export function TopBar({
  userName,
  userImage,
  theme,
}: {
  userName?: string | null;
  userImage?: string | null;
  theme?: Theme;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--surface-border)] bg-[var(--surface)]/90 px-6 py-3 backdrop-blur">
      <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm"
          aria-hidden
        >
          <CheckCheck className="h-4.5 w-4.5" strokeWidth={2.5} />
        </span>
        Core Habits
      </span>

      <div className="flex items-center gap-3">
        <a
          href="/progress"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <BarChart3 className="h-4 w-4" aria-hidden />
          Progress
        </a>
        <ThemeToggle initialTheme={theme ?? "system"} />

        <div className="group relative">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userImage}
              alt={userName ?? "Account"}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-medium text-white">
              {userName?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </button>

        <div className="invisible absolute right-0 z-10 mt-2 w-44 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] py-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
          <div className="truncate px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            {userName}
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Sign out
            </button>
          </form>
          <a
            href="/settings"
            className="block px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Delete account
          </a>
        </div>
      </div>
      </div>
    </header>
  );
}
