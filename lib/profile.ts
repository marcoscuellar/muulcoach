// ===========================================================================
// Coach Bob — the adaptive coaching identity that lives across the whole app.
// Onboarding captures HOW a user wants to be coached; Coach Bob keeps the same
// underlying logic but changes his delivery (language, pressure, cadence).
// Profile persists to localStorage (swap for a per-user DB row when real
// accounts land — the shape stays identical).
// ===========================================================================

import { pushUserData } from "@/lib/sync";

export const PROFILE_KEY = "muul-profile-v1";

export type CoachStyle = "tough" | "direct" | "gentle" | "structured";
export type Cadence = "frequent" | "firm";

export type Profile = {
  name: string;
  style: CoachStyle;
  cadence: Cadence;
  onboardedAt: number;
};

export const COACH_NAME = "Coach Bob";

export const STYLES: { id: CoachStyle; label: string; blurb: string }[] = [
  { id: "tough", label: "Tough love", blurb: "Call me out. No excuses. Get me moving." },
  { id: "direct", label: "Direct but encouraging", blurb: "Be honest, give me a push, and remind me I can do this." },
  { id: "gentle", label: "Gentle accountability", blurb: "Keep it low-pressure, supportive, and help me take the next step." },
  { id: "structured", label: "Highly structured", blurb: "Give me clear steps, timing, and a specific plan." },
];

export const CADENCES: { id: Cadence; label: string; blurb: string }[] = [
  { id: "frequent", label: "More frequent check-ins", blurb: "Nudge me often — small and steady." },
  { id: "firm", label: "Less frequent, but firmer", blurb: "Leave me alone, then hold the line hard." },
];

// ---- Persistence ----------------------------------------------------------

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Profile;
    if (!p.style || !p.cadence) return null;
    return p;
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile) {
  try {
    const stamped = { ...p, updatedAt: Date.now() };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(stamped));
    pushUserData("profile", stamped); // sync to the account (no-op when signed out)
  } catch {
    /* ignore */
  }
}

export function isOnboarded(): boolean {
  return loadProfile() != null;
}

// ===========================================================================
// Coach Bob — adaptive system prompt. Same coach, tuned delivery.
// ===========================================================================

const STYLE_DIRECTIVE: Record<CoachStyle, string> = {
  tough:
    "Delivery: TOUGH LOVE. Call out excuses directly and refuse to let them off the hook. Push hard. You're always in their corner — never cruel, never clinical.",
  direct:
    "Delivery: DIRECT BUT ENCOURAGING. Straight talk with no fluff, then a firm push and a genuine note of belief in them.",
  gentle:
    "Delivery: GENTLE ACCOUNTABILITY. Warm and low-pressure. Meet them where they are. Shrink the ask to something tiny and doable, and celebrate motion.",
  structured:
    "Delivery: HIGHLY STRUCTURED. Give concrete steps, specific times, and a clear plan or checklist. Turn vague intentions into a scheduled next action.",
};

const CADENCE_DIRECTIVE: Record<Cadence, string> = {
  frequent: "Cadence: they like frequent, small touchpoints. Offer to check back in soon and keep momentum tight.",
  firm: "Cadence: they want fewer check-ins but firmer ones. Don't hover — when you do engage, hold the line.",
};

/**
 * Builds Coach Bob's system prompt from the user's coaching profile and their
 * current active goals. Personality is constant; STYLE_DIRECTIVE tunes delivery.
 */
export function coachBobSystem(profile: Profile | null, goalsSummary: string): string {
  const style = profile?.style ?? "direct";
  const cadence = profile?.cadence ?? "frequent";
  const who = profile?.name ? ` You're coaching ${profile.name}.` : "";
  return `You are Coach Bob — the user's personal accountability coach.${who}
You are Direct, Empathetic, and Action-Oriented. You talk like a sharp peer who's in their corner, never like a therapist or a corporate bot.
Hard rules:
- Never use clinical/therapy-speak ("How does that make you feel?", "I understand your struggle").
- Keep replies to 2-4 short sentences.
- Every reply ends with ONE clear physical next action or a specific choice.
- Use plain, peer-to-peer language ("What's the move?", "Let's pivot", "Life happened, right?").
- No emojis.
${STYLE_DIRECTIVE[style]}
${CADENCE_DIRECTIVE[cadence]}
${goalsSummary ? `The user's active goals right now:\n${goalsSummary}\nReference these specifically when relevant.` : "The user has no active goals yet — help them pick ONE that matters and define its first physical step."}`;
}
