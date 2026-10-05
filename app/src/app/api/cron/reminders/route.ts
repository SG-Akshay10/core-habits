import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushNotification, isPushConfigured } from "@/lib/push";
import { sendReminderEmail, isEmailConfigured } from "@/lib/email";
import { todayInTimezone } from "@/lib/date";

/**
 * GET /api/cron/reminders — fires due reminders.
 *
 * Intended to be invoked once a minute by an external scheduler (Vercel
 * Cron, a QStash schedule, etc.) — see vercel.json. Protected by a shared
 * secret so it can't be triggered by anonymous requests.
 *
 * Scaling note: this implementation queries all enabled reminders and
 * filters them in the request handler, which is fine for a handful of
 * users but will not scale past that — see the PRD's "Production
 * Considerations". Before a real launch, replace this with a queue-backed
 * fan-out (e.g. push each due reminder as a message onto a queue/job table
 * and let workers send the pushes), so one slow or failing send can never
 * block or fail the whole batch, and so the job can't time out under load.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const provided =
    req.headers.get("x-cron-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pushEnabled = isPushConfigured();
  const emailEnabled = isEmailConfigured();
  if (!pushEnabled && !emailEnabled) {
    return NextResponse.json({ ok: true, sent: 0, skipped: "not-configured" });
  }

  const reminders = await prisma.reminder.findMany({
    where: { enabled: true },
    include: {
      habit: {
        include: {
          user: { include: { pushSubscriptions: true } },
        },
      },
    },
  });

  let sent = 0;
  let emailsSent = 0;
  let skippedAlreadyLogged = 0;
  let pruned = 0;
  const errors: string[] = [];

  for (const reminder of reminders) {
    const habit = reminder.habit;
    const user = habit.user;
    const timezone = user.timezone ?? "UTC";

    const today = todayInTimezone(timezone);
    const nowHHMM = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
    const dayOfWeek = new Date(
      new Date().toLocaleString("en-US", { timeZone: timezone }),
    ).getDay();

    if (reminder.time !== nowHHMM) continue;
    if (!reminder.daysOfWeek.includes(dayOfWeek)) continue;
    if (reminder.lastSentFor === today) continue; // already handled this minute/day

    // Smart skip: don't nag if it's already logged today.
    const alreadyLogged = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId: habit.id, date: today } },
    });
    if (alreadyLogged) {
      skippedAlreadyLogged += 1;
      await prisma.reminder
        .update({ where: { id: reminder.id }, data: { lastSentFor: today } })
        .catch(() => {});
      continue;
    }

    if (pushEnabled) {
      for (const sub of user.pushSubscriptions) {
        const result = await sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          {
            title: "Habit reminder",
            body: `Time for "${habit.name}"`,
            habitId: habit.id,
            url: `/habits/${habit.id}`,
          },
        );
        if (result.ok) {
          sent += 1;
        } else if (result.expired) {
          // Dead subscription — prune it so it never errors future runs.
          await prisma.pushSubscription
            .delete({ where: { id: sub.id } })
            .catch(() => {});
          pruned += 1;
        } else {
          errors.push(`${habit.id}:${sub.id}`);
        }
      }
    }

    // Email fallback (PRD 6.9): only for users with no push subscriptions
    // at all — e.g. iOS Safari without the PWA installed to the home
    // screen — so installed users don't get a duplicate email + push.
    if (emailEnabled && user.pushSubscriptions.length === 0 && user.email) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const result = await sendReminderEmail(
        user.email,
        habit.name,
        `${baseUrl}/habits/${habit.id}`,
      );
      if (result.ok) emailsSent += 1;
      else errors.push(`email:${habit.id}:${user.id}`);
    }

    await prisma.reminder
      .update({ where: { id: reminder.id }, data: { lastSentFor: today } })
      .catch(() => {});
  }

  return NextResponse.json({
    ok: true,
    sent,
    emailsSent,
    skippedAlreadyLogged,
    pruned,
    errors: errors.length,
  });
}
