export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 prose dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p>Last updated: September 30, 2026.</p>
      <p>
        Core Habits collects only the information needed to run the service:
        your name, email address, profile picture, and timezone, obtained via
        Google Sign-In, plus the habit data you create in the app.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Name, email, avatar URL, and timezone from your Google account</li>
        <li>Habits and habit logs you create in the app</li>
      </ul>
      <h2>What we don&apos;t do</h2>
      <p>
        We don&apos;t sell your data, and we don&apos;t request any Google
        scopes beyond basic profile and email.
      </p>
      <h2>Deletion</h2>
      <p>
        You can permanently delete your account and all associated data at
        any time from Settings.
      </p>
      <h2>Contact</h2>
      <p>Questions? Reach out via the contact details on our GitHub repo.</p>
    </main>
  );
}
