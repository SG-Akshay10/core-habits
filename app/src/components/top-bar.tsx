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
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3 dark:border-gray-800">
      <span className="text-lg font-semibold">Core Habits</span>

      <div className="flex items-center gap-3">
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
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
              {userName?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </button>

        <div className="invisible absolute right-0 z-10 mt-2 w-44 rounded-md border border-gray-200 bg-white py-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-900">
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
