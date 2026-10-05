import { auth } from "@/auth";
import { TopBar } from "@/components/top-bar";
import { AnalyticsView } from "@/components/analytics-view";
import { prisma } from "@/lib/prisma";
import { todayInTimezone } from "@/lib/date";
import { computeAnalyticsData } from "@/lib/analytics";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { timezone: true, theme: true },
  });
  const today = todayInTimezone(user?.timezone ?? "UTC");
  const data = await computeAnalyticsData(session.user.id, today);

  return (
    <div className="telemetry-dashboard min-h-screen">
      <TopBar
        userName={session.user.name}
        userImage={session.user.image}
        theme={user?.theme === "dark" ? "dark" : "light"}
      />
      <AnalyticsView data={data} />
    </div>
  );
}
