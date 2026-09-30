"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setPending(true);
    const res = await fetch("/api/user/delete", { method: "POST" });
    setPending(false);
    if (res.ok) {
      router.push("/");
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="mt-10 rounded-lg border border-red-200 p-6 dark:border-red-900">
        <h2 className="font-medium text-red-600">Delete account</h2>
        <p className="mt-2 text-sm text-gray-500">
          This permanently deletes your account and all associated data. This
          cannot be undone.
        </p>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="mt-4 rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Delete my account
          </button>
        ) : (
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleDelete}
              disabled={pending}
              className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? "Deleting…" : "Yes, permanently delete"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-md px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
