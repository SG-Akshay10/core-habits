import { BarChart3, Settings, LogOut } from "lucide-react";
import Link from "next/link";
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
      <Link href="/dashboard" className="font-serif text-xl font-semibold tracking-[0.015em] text-gray-900 dark:text-gray-100">
        Core Habits
      </Link>

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
          aria-label="Open account menu"
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
              <LogOut className="mr-2 inline h-4 w-4" />
              Sign out
            </button>
          </form>
          <Link
            href="/settings"
            className="block px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Settings className="mr-2 inline h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>
      </div>
    </header>
  );
}
