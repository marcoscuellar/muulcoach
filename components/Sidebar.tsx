"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MuulMarkVolt,
  HomeIcon,
  ComposeIcon,
  CalendarIcon,
  CoachIcon,
  WingmanIcon,
  PlusIcon,
} from "@/components/icons";
import { STREAK_DAYS } from "@/lib/data";
import { loadProfile } from "@/lib/profile";
import { loadGoals, getActiveGoal, GOALS_EVENT, DEFAULT_GOAL_TYPE, type GoalType } from "@/lib/wingman";
import { GOAL_TOOLS } from "@/lib/goalTools";
import { SYNCED_EVENT } from "@/lib/sync";
import SignOutButton from "@/components/SignOutButton";
import DemoToggle from "@/components/DemoToggle";

// Fixed nav — always visible. The two tools below adapt to the active goal.
const FIXED_NAV = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/coach", label: "Chat", Icon: CoachIcon, star: true },
  { href: "/goals", label: "Goals", Icon: WingmanIcon },
];

// The two dynamic tool slots always map to the same pages — only labels change.
const SLOT_ICON = { make: ComposeIcon, track: CalendarIcon };

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "YN"
  );
}

export default function Sidebar({ userEmail, demo = false }: { userEmail?: string; demo?: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const [profileName, setProfileName] = useState<string>("");
  const [activeType, setActiveType] = useState<GoalType | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (p?.name && p.name !== "friend") setProfileName(p.name);
  }, []);

  // Track the active goal's type so the toolbox reflects what the user is
  // working on. Re-read on navigation, on goal changes, and on account sync.
  useEffect(() => {
    const read = () => {
      const g = getActiveGoal(loadGoals());
      setActiveType(g ? g.type ?? DEFAULT_GOAL_TYPE : null);
    };
    read();
    window.addEventListener(GOALS_EVENT, read);
    window.addEventListener(SYNCED_EVENT, read);
    return () => {
      window.removeEventListener(GOALS_EVENT, read);
      window.removeEventListener(SYNCED_EVENT, read);
    };
  }, [pathname]);

  const displayName = profileName || (userEmail ? userEmail.split("@")[0] : "You");
  const subline = userEmail || "Not signed in";
  const tools = activeType ? GOAL_TOOLS[activeType] : null;

  const navLinkClass = (active: boolean) =>
    `flex w-full items-center gap-[11px] rounded-btn px-[13px] py-[11px] text-left font-display text-sm font-semibold transition-colors ${
      active ? "bg-paper text-volt shadow-sm" : "bg-transparent text-onink-soft hover:bg-white/[0.06] hover:text-white"
    }`;

  return (
    <aside className="flex flex-col gap-[26px] border-r border-white/10 bg-ink px-4 py-[22px] text-onink">
      <div className="flex items-center gap-[11px] px-2 py-1">
        <MuulMarkVolt size={32} />
        <span className="font-display text-[19px] font-bold tracking-[-0.02em] text-white">Coach Bob</span>
      </div>

      <nav className="flex flex-col gap-1">
        {FIXED_NAV.map(({ href, label, Icon, star }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className={navLinkClass(active)}>
              <Icon />
              {label}
              {star && !active && <span className="ml-auto h-[7px] w-[7px] rounded-full bg-onink-aqua" />}
            </Link>
          );
        })}

        {tools ? (
          // Active goal → its two tools (build ONCE; only labels differ by type).
          (["make", "track"] as const).map((slot) => {
            const Icon = SLOT_ICON[slot];
            const { href, label } = tools[slot];
            return (
              <Link key={slot} href={href} className={navLinkClass(isActive(href))}>
                <Icon />
                {label}
              </Link>
            );
          })
        ) : (
          // No active goal → let Coach Bob set the first one up (no empty section).
          <Link
            href="/coach"
            className="mt-1 flex w-full items-center gap-[11px] rounded-btn border border-dashed border-white/25 px-[13px] py-[11px] font-display text-sm font-semibold text-onink-soft transition-colors hover:border-white/50 hover:text-white"
          >
            <PlusIcon />
            Set your first goal
          </Link>
        )}
      </nav>

      <div className="mt-auto flex flex-col gap-[14px]">
        <div className="rounded-card bg-paper p-4">
          <div className="flex items-center gap-2 font-display text-[15px] font-bold text-volt">
            <span className="h-2 w-2 rounded-full bg-volt" />
            {demo ? `${STREAK_DAYS}-day streak` : "Start your streak"}
          </div>
          <div className="mt-2 font-mono text-[10px] tracking-[0.04em] text-muted-fog">
            {demo ? "POST TODAY TO KEEP IT" : "POST TODAY TO BEGIN IT"}
          </div>
        </div>
        <DemoToggle demo={demo} />
        <div className="flex items-center gap-[10px] px-[6px] py-1">
          <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-tint-mint font-display text-[13px] font-bold text-olive-deep">
            {initials(displayName)}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="truncate font-display text-[13px] font-semibold capitalize text-white">{displayName}</div>
            <div className="truncate text-[11px] text-onink-faint">{subline}</div>
          </div>
          {userEmail && <SignOutButton />}
        </div>
      </div>
    </aside>
  );
}
