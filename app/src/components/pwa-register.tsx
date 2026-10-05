"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { syncQueuedRequests } from "@/lib/offline-queue";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Registers the service worker, syncs any queued offline log writes once
 * back online, and offers a lightweight "Install app" prompt (Chrome/Edge
 * fire `beforeinstallprompt`; Safari/iOS require manual "Add to Home
 * Screen", so there we just don't show a button).
 */
export function PwaRegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener("statechange", () => {
            if (newWorker.state === "activated") {
              // A new shell version took over — nothing destructive to do,
              // the next navigation will pick it up automatically.
            }
          });
        });
      })
      .catch(() => {});

    syncQueuedRequests();
    const onOnline = () => syncQueuedRequests();
    window.addEventListener("online", onOnline);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!installEvent || installed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4">
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900">
        <span>Install Core Habits for quick, offline-friendly access.</span>
        <button
          type="button"
          onClick={async () => {
            await installEvent.prompt();
            await installEvent.userChoice;
            setInstallEvent(null);
          }}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900"
        >
          Install
        </button>
        <button
          type="button"
          onClick={() => setInstallEvent(null)}
          aria-label="Dismiss"
          className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
