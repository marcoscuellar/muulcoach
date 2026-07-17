"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isOnboarded } from "@/lib/profile";

// Gates the main app behind the first-run experience. If there's no coaching
// profile yet, send the user to /onboarding. (When real accounts land, this
// also becomes the auth check.)
export default function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isOnboarded()) {
      router.replace("/onboarding");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center font-mono text-[12px] text-muted-fog">
        Loading Coach Bob…
      </div>
    );
  }
  return <>{children}</>;
}
