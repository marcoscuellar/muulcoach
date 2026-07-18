"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MuulMarkVolt } from "@/components/icons";
import { loadProfile, COACH_NAME, type Profile } from "@/lib/profile";
import { loadGoals, isStuck, type Goal } from "@/lib/wingman";
import { SYNCED_EVENT } from "@/lib/sync";

// Coach Bob on Home — he's present across the app, not siloed in one tab.
// Reads the coaching profile + goals and surfaces the ONE next move.
export default function CoachBobHomeCard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const refresh = () => {
      setProfile(loadProfile());
      setGoals(loadGoals());
    };
    refresh();
    window.addEventListener(SYNCED_EVENT, refresh);
    return () => window.removeEventListener(SYNCED_EVENT, refresh);
  }, []);

  const active = goals.filter((g) => g.state === "active" && !g.done);
  const stuck = active.filter((g) => isStuck(g));
  const name = profile?.name && profile.name !== "friend" ? profile.name : null;

  let line: string;
  let cta: { label: string; href: string };
  if (stuck.length > 0) {
    line = `"${stuck[0].title}" slipped. Let's not let it disappear — two minutes in my office and we recalibrate.`;
    cta = { label: "Check in", href: "/coach" };
  } else if (active.length > 0) {
    const g = active[0];
    line = g.microAction
      ? `Your move on "${g.title}": ${g.microAction}. Do that one thing and log it.`
      : `You've got "${g.title}" going. What's the first physical step?`;
    cta = { label: "Open the plan", href: "/goals" };
  } else {
    line = `${name ? `${name}, ` : ""}we haven't set a goal yet. Pick ONE that matters and I'll build the plan with you.`;
    cta = { label: "Set a goal", href: "/goals" };
  }

  return (
    <div className="rounded-card bg-ink p-[22px]">
      <div className="mb-3 flex items-center gap-[9px]">
        <MuulMarkVolt />
        <span className="font-mono text-[11px] text-white">{COACH_NAME.toUpperCase()}</span>
        {active.length > 0 && (
          <span className="ml-auto font-mono text-[10px] text-onink-faint">{active.length} active</span>
        )}
      </div>
      <p className="m-0 mb-4 text-[15px] leading-[1.5] text-onink">{line}</p>
      <div className="flex gap-2">
        <Link
          href={cta.href}
          className="inline-block rounded-[10px] border-none bg-paper px-4 py-[9px] font-display text-[13px] font-bold text-ink"
        >
          {cta.label}
        </Link>
        <Link
          href="/coach"
          className="inline-block rounded-[10px] border-[1.5px] border-onink-faint/40 px-4 py-[9px] font-display text-[13px] font-semibold text-onink"
        >
          Talk to {COACH_NAME.split(" ")[1]}
        </Link>
      </div>
    </div>
  );
}
