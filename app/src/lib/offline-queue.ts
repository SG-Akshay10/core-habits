/**
 * Offline queue for habit-log writes (PUT/DELETE on
 * /api/habits/:id/logs/:date). When a request fails because the device is
 * offline, it is queued in IndexedDB and replayed once connectivity
 * returns. Conflict handling is last-write-wins per (habit, date), which
 * matches the API's idempotent upsert/delete semantics — replaying a
 * queued request is always safe even if it's replayed twice.
 */

const DB_NAME = "core-habits-offline";
const DB_VERSION = 1;
const STORE = "log-queue";

export type QueuedLogRequest = {
  id?: number;
  habitId: string;
  date: string;
  method: "PUT" | "DELETE";
  body?: { note?: string | null; value?: number };
  queuedAt: number;
};

function isBrowser() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Queues a log write to retry later (call this when a fetch fails offline). */
export async function queueLogRequest(
  entry: Omit<QueuedLogRequest, "id" | "queuedAt">,
): Promise<void> {
  if (!isBrowser()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).add({ ...entry, queuedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getQueuedRequests(): Promise<QueuedLogRequest[]> {
  if (!isBrowser()) return [];
  const db = await openDb();
  const result = await new Promise<QueuedLogRequest[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as QueuedLogRequest[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

async function removeQueuedRequest(id: number): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

let syncing = false;

/**
 * Replays every queued request against the API, oldest first. Each request
 * is idempotent server-side, so partial failures (still offline, or the
 * habit was deleted) simply leave the remaining items queued for the next
 * attempt.
 */
export async function syncQueuedRequests(): Promise<{ synced: number; failed: number }> {
  if (!isBrowser() || syncing) return { synced: 0, failed: 0 };
  syncing = true;
  let synced = 0;
  let failed = 0;
  try {
    const queued = await getQueuedRequests();
    queued.sort((a, b) => a.queuedAt - b.queuedAt);
    for (const item of queued) {
      try {
        const res = await fetch(
          `/api/habits/${item.habitId}/logs/${encodeURIComponent(item.date)}`,
          {
            method: item.method,
            headers: item.body ? { "Content-Type": "application/json" } : undefined,
            body: item.body ? JSON.stringify(item.body) : undefined,
          },
        );
        if (!res.ok) throw new Error("sync failed");
        if (item.id !== undefined) await removeQueuedRequest(item.id);
        synced += 1;
      } catch {
        failed += 1;
        // Stop on first network failure — likely still offline.
        break;
      }
    }
  } finally {
    syncing = false;
  }
  return { synced, failed };
}

export async function queuedCount(): Promise<number> {
  const queued = await getQueuedRequests();
  return queued.length;
}
