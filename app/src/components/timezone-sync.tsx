"use client";

import { useEffect } from "react";

/**
 * Fires once on mount and stores the browser's IANA timezone against the
 * signed-in user. Safe to call repeatedly; the API route is idempotent.
 */
export function TimezoneSync() {
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timezone) return;

    fetch("/api/user/timezone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone }),
    }).catch(() => {
      // Non-critical — worst case the user keeps the default timezone.
    });
  }, []);

  return null;
}
