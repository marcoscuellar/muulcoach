import type { GoalType } from "@/lib/wingman";

// One place to declare the two tools each goal type gets in the sidebar.
// Both types reuse the SAME pages (one composer, one calendar) — only the
// labels change. Adding a future goal type = adding ONE entry here, no new
// components.
export const GOAL_TOOLS = {
  linkedin: {
    make: { label: "Write a post", href: "/composer" },
    track: { label: "Content calendar", href: "/calendar" },
  },
  fitness: {
    make: { label: "Log workout", href: "/composer" },
    track: { label: "Consistency calendar", href: "/calendar" },
  },
} as const satisfies Record<GoalType, { make: { label: string; href: string }; track: { label: string; href: string } }>;
