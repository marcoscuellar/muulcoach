import { redirect } from "next/navigation";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { auth, authEnabled } from "@/auth";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  if (authEnabled) {
    let broke = false;
    let session = null;
    try {
      session = await auth();
    } catch {
      broke = true;
    }
    if (!broke && !session?.user) redirect("/login");
  }
  return <OnboardingFlow />;
}
