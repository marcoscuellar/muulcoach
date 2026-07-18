"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusIcon } from "@/components/icons";
import SupportWidget from "@/components/SupportWidget";

const TITLE_MAP: Record<string, [string, string]> = {
  "/": ["Home", "Your streak, your queue, your next move"],
  "/composer": ["Composer", "Coach Bob writes it. You approve it."],
  "/trending": ["Trending", "What’s hot right now + your daily brief"],
  "/calendar": ["Calendar", "Week of July 13"],
  "/coach": ["Chat", "Coach Bob's office — talk it out"],
  "/goals": ["Goals", "Coach Bob's plan — max 3 at a time"],
  "/analytics": ["Analytics", "Proof the streak is working"],
  "/library": ["Library", "Every post you’ve shipped"],
};

export default function TopBar() {
  const pathname = usePathname();
  const [title, sub] = TITLE_MAP[pathname] ?? ["Coach Bob", "Show up. Do the thing."];
  const showNewBtn = pathname !== "/composer";

  return (
    <header className="sticky top-0 z-[5] flex items-center justify-between border-b border-muted-line bg-paper/90 px-[34px] py-5 backdrop-blur-md">
      <div>
        <div className="font-display text-[22px] font-bold tracking-[-0.02em]">{title}</div>
        <div className="mt-[2px] text-[13px] text-muted-fog">{sub}</div>
      </div>
      <div className="flex items-center gap-3">
        <SupportWidget />
        {showNewBtn && (
          <Link
            href="/composer"
            className="inline-flex items-center gap-2 rounded-[11px] border-none bg-volt px-[18px] py-[11px] font-display text-sm font-bold text-ink"
          >
            <PlusIcon size={16} />
            New post
          </Link>
        )}
      </div>
    </header>
  );
}
