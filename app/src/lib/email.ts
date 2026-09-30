import nodemailer from "nodemailer";

/**
 * Minimal SMTP email sender for the reminder fallback (PRD 6.9, "Could"
 * priority) — used only when a user has no push subscriptions at all
 * (e.g. iOS Safari without the PWA installed to the home screen).
 *
 * Configure via SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASSWORD /
 * SMTP_FROM. If unset, `isEmailConfigured()` returns false and callers
 * should skip the fallback rather than throw.
 */
let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured — email fallback is disabled.");
  }
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD,
  );
}

export async function sendReminderEmail(
  to: string,
  habitName: string,
  habitUrl: string,
): Promise<{ ok: boolean; error?: unknown }> {
  try {
    const from = process.env.SMTP_FROM ?? "Core Habits <no-reply@example.com>";
    await getTransporter().sendMail({
      to,
      from,
      subject: `Reminder: ${habitName}`,
      text: `Just a gentle nudge — it's time for "${habitName}". Log it here: ${habitUrl}`,
      html: `<p>Just a gentle nudge — it's time for <strong>${habitName}</strong>.</p><p><a href="${habitUrl}">Log it here</a>.</p>`,
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}
