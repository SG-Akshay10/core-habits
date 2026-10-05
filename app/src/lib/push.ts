import webpush from "web-push";

/**
 * Web Push sender, backed by VAPID keys stored as secrets (never commit).
 * Generate a pair with `npx web-push generate-vapid-keys` and set:
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto: or https: URL)
 */
let configured = false;

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:support@example.com";
  if (!publicKey || !privateKey) {
    throw new Error(
      "VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY are not set — web push is disabled.",
    );
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  habitId?: string;
  url?: string;
};

export type PushSubscriptionRecord = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * Sends a push notification to a single subscription.
 * Returns { ok: true } on success, or { ok: false, expired: true } when the
 * push service reports the subscription is gone (404/410) so the caller can
 * prune it — one dead subscription must never fail an entire reminder batch.
 */
export async function sendPushNotification(
  sub: PushSubscriptionRecord,
  payload: PushPayload,
): Promise<{ ok: boolean; expired?: boolean; error?: unknown }> {
  ensureConfigured();
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload),
    );
    return { ok: true };
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number })?.statusCode;
    if (statusCode === 404 || statusCode === 410) {
      return { ok: false, expired: true, error };
    }
    return { ok: false, error };
  }
}

export function isPushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}
