"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isOnboarded } from "@/lib/profile";
import { SYNCED_EVENT } from "@/lib/sync";

// Gates the main app behind the first-run experience. If there's no coaching
// profile yet, send the user to /onboarding — but first give account sync a
// brief moment to pull an existing profile in, so a new device doesn't force
// you to re-onboard.
export default function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isOnboarded()) {
      setReady(true);
      return;
    }

    let settled = false;
    const settle = () => {
      if (settled) return;
      if (isOnboarded()) {
        settled = true;
        setReady(true);
      }
    };
    window.addEventListener(SYNCED_EVENT, settle);
    // Grace period for sync; if still no profile, this really is a new user.
    const t = setTimeout(() => {
      if (settled) return;
      settled = true;
      if (isOnboarded()) setReady(true);
      else router.replace("/onboarding");
    }, 1500);

    return () => {
      window.removeEventListener(SYNCED_EVENT, settle);
      clearTimeout(t);
    };
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
