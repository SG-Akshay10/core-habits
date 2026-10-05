import { BarChart3, Settings, LogOut, LayoutDashboard } from "lucide-react";
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
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--surface-border)] bg-[var(--surface)]/85 px-4 py-3 backdrop-blur-xl sm:px-6">
      <Link href="/dashboard" className="font-serif text-lg font-semibold tracking-[0.015em] text-gray-900 dark:text-gray-100 sm:text-xl">
        Core Habits
      </Link>

      <div className="flex items-center gap-3">
        <nav aria-label="Main navigation" className="flex items-center gap-1">
          <Link href="/dashboard" className="top-nav-link">
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            Dashboard
          </Link>
          <Link href="/analytics" className="top-nav-link">
            <BarChart3 className="h-4 w-4" aria-hidden />
            Analytics
          </Link>
        </nav>
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

        <div className="invisible absolute right-0 z-10 mt-2 w-56 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] py-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <div className="truncate px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            {userName}
          </div>
          <div className="flex items-center justify-between border-y border-[var(--surface-border)] px-4 py-2">
            <span className="text-sm">Appearance</span>
            <ThemeToggle initialTheme={theme ?? "light"} />
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
