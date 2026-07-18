import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import OnboardingGate from "@/components/onboarding/OnboardingGate";
import SyncProvider from "@/components/SyncProvider";
import { auth, authEnabled } from "@/auth";
import { isDemo } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let userEmail: string | undefined;

  if (authEnabled) {
    // Fail-open: if the auth infra itself errors we render the app rather than
    // white-walling the live site. A clean "no session" still routes to /login.
    let broke = false;
    let session = null;
    try {
      session = await auth();
    } catch {
      broke = true;
    }
    if (!broke && !session?.user) redirect("/login");
    userEmail = session?.user?.email ?? undefined;
  }

  return (
    <div className="grid h-screen grid-cols-[248px_1fr] overflow-hidden bg-paper text-ink">
      <SyncProvider authed={Boolean(userEmail)} />
      <Sidebar userEmail={userEmail} demo={isDemo()} />
      <main className="flex flex-col overflow-y-auto">
        <TopBar />
        <div className="min-h-0 flex-1">
          <OnboardingGate>{children}</OnboardingGate>
        </div>
      </main>
    </div>
  );
}
