import { cookies } from "next/headers";

// Demo mode. When ON, the app shows the rich seeded sample data (for demos /
// presentations). When OFF — the default — a real account shows clean, empty
// states instead of placeholder numbers. Stored in the cb_demo cookie so
// server components can read it.
export const DEMO_COOKIE = "cb_demo";

export function isDemo(): boolean {
  return cookies().get(DEMO_COOKIE)?.value === "1";
}
