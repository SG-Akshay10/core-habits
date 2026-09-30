import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { THEME_COOKIE, isValidTheme } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Core Habits",
  description: "A simple, one-tap daily habit tracker.",
};

// Inline, pre-hydration script: resolves "system" to the OS preference and
// applies the `.dark` class before first paint, so there is never a flash
// of the wrong theme regardless of which page loads first.
const themeInitScript = `
(function () {
  try {
    var theme = document.cookie.match(/(?:^|; )theme=([^;]*)/);
    theme = theme ? decodeURIComponent(theme[1]) : "system";
    var isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isValidTheme(cookieTheme) ? cookieTheme : "system";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${
        theme === "dark" ? " dark" : ""
      }`}
    >
      <head>
        {theme === "system" && (
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        )}
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

