import { auth } from "@/auth";
import { TopBar } from "@/components/top-bar";
import { TimezoneSync } from "@/components/timezone-sync";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      <TimezoneSync />
      <TopBar userName={session.user.name} userImage={session.user.image} />
      <main className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">
          Welcome, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="max-w-md text-gray-500">
          Your dashboard is empty for now — habit creation ships in Week 2.
        </p>
      </main>
    </div>
  );
}
