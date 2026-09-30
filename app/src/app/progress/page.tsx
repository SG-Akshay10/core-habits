import { auth } from "@/auth";
import { TopBar } from "@/components/top-bar";
import { ProgressView } from "@/components/progress-view";
import { prisma } from "@/lib/prisma";
import { todayInTimezone } from "@/lib/date";
import { computeProgressData } from "@/lib/progress";
import { redirect } from "next/navigation";

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { timezone: true, theme: true },
  });
  const today = todayInTimezone(user?.timezone ?? "UTC");
  const data = await computeProgressData(session.user.id, today);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TopBar
        userName={session.user.name}
        userImage={session.user.image}
        theme={(user?.theme as "light" | "dark" | "system") ?? "system"}
      />
      <ProgressView data={data} />
    </div>
  );
}
