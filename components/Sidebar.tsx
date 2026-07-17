"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MuulMark,
  HomeIcon,
  ComposeIcon,
  TrendingIcon,
  CalendarIcon,
  CoachIcon,
  AnalyticsIcon,
  LibraryIcon,
} from "@/components/icons";
import { STREAK_DAYS } from "@/lib/data";
import { DEFAULT_AUTHOR_NAME, DEFAULT_AUTHOR_TITLE } from "@/lib/prompts";

const NAV = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/composer", label: "Composer", Icon: ComposeIcon },
  { href: "/trending", label: "Trending", Icon: TrendingIcon },
  { href: "/calendar", label: "Calendar", Icon: CalendarIcon },
  { href: "/coach", label: "Coach", Icon: CoachIcon },
  { href: "/analytics", label: "Analytics", Icon: AnalyticsIcon },
  { href: "/library", label: "Library", Icon: LibraryIcon },
];

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

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside className="flex flex-col gap-[26px] border-r border-muted-line bg-paper px-4 py-[22px]">
      <div className="flex items-center gap-[11px] px-2 py-1">
        <MuulMark />
        <span className="font-display text-[19px] font-bold tracking-[-0.02em]">Muul</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex w-full items-center gap-[11px] rounded-btn px-[13px] py-[11px] text-left font-display text-sm font-semibold transition-colors ${
                active ? "bg-ink text-paper" : "bg-transparent text-ink hover:bg-surface"
              }`}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-[14px]">
        <div className="rounded-card bg-ink p-4">
          <div className="flex items-center gap-2 font-display text-[15px] font-bold text-volt">
            <span className="h-2 w-2 rounded-full bg-volt" />
            {STREAK_DAYS}-day streak
          </div>
          <div className="mt-2 font-mono text-[10px] tracking-[0.04em] text-onink-faint">
            POST TODAY TO KEEP IT
          </div>
        </div>
        <div className="flex items-center gap-[10px] px-[6px] py-1">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-tint-mint font-display text-[13px] font-bold text-olive-deep">
            {initials(DEFAULT_AUTHOR_NAME)}
          </div>
          <div className="overflow-hidden">
            <div className="truncate font-display text-[13px] font-semibold">{DEFAULT_AUTHOR_NAME}</div>
            <div className="truncate text-[11px] text-muted-fog">{DEFAULT_AUTHOR_TITLE}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
