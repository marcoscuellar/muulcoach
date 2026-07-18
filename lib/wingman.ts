// ===========================================================================
// WINGMAN — ADHD co-pilot logic + persona copy
// ---------------------------------------------------------------------------
// ALL user-facing Wingman voice lives in the WINGMAN object below, grouped by
// the four logic modules so persona edits never touch the mechanics:
//   - CommitmentThresholdLogic   (goal input engine)
//   - CalibrationProtocol        (missed-task barrier audit)
//   - ADHDTaxTimeLogic           (departure-time math)
//   - PersonaConstraints         (global voice rules)
// Persona: Direct, Empathetic, Action-Oriented. Peer-to-peer, never clinical.
// ===========================================================================

import { pushUserData } from "@/lib/sync";

export const WINGMAN_STORAGE_KEY = "muul-wingman-v1";

// ---- Types ----------------------------------------------------------------

export type SubTask = { id: string; text: string; done: boolean };
export type GoalState = "active" | "draft" | "paused";
export type ProgressLog = { id: string; at: number; note: string };

// The goal's domain — drives which two tools show in the sidebar (see
// lib/goalTools). Add a new type here + one entry in GOAL_TOOLS to extend.
export type GoalType = "linkedin" | "fitness";
export const GOAL_TYPES: GoalType[] = ["linkedin", "fitness"];
export const DEFAULT_GOAL_TYPE: GoalType = "linkedin";

/** Coerce arbitrary input (e.g. from Coach Bob) to a known goal type. */
export function normalizeGoalType(value: unknown): GoalType {
  return GOAL_TYPES.includes(value as GoalType) ? (value as GoalType) : DEFAULT_GOAL_TYPE;
}

export type Goal = {
  id: string;
  title: string;
  microAction: string; // "" while a goal is still a Draft (the first physical step)
  type: GoalType; // domain — decides the sidebar tools
  state: GoalState;
  done: boolean;
  createdAt: number;
  checkInAt: number | null; // deadline / check-in timestamp (ms)
  subTasks: SubTask[]; // milestones
  outcome?: string; // the actual result we're chasing
  cadence?: string; // the schedule, e.g. "Mon/Wed/Fri, 20 min"
  logs?: ProgressLog[]; // how progress gets logged
};

/** Fired (client) whenever the goal store changes, so the nav can re-read. */
export const GOALS_EVENT = "coachbob:goals";

/**
 * The one goal the user is "currently working on" — drives the sidebar tools.
 * With up to 3–4 active goals, this is the first active (not-done) one.
 */
export function getActiveGoal(goals: Goal[]): Goal | null {
  return goals.find((g) => g.state === "active" && !g.done) ?? null;
}

// CommitmentThresholdLogic guardrail: keep the active list small so Coach Bob
// can hold the user to what actually matters. Soft target 3, hard ceiling 4.
export const ACTIVE_GOAL_SOFT_CAP = 3;
export const ACTIVE_GOAL_HARD_CAP = 4;

export type DepartureAlarm = {
  id: string;
  label: string;
  eventAt: number; // the event time (ms)
  goAt: number; // the calculated Go-Time (ms)
  baseMinutes: number;
  bufferedMinutes: number;
};

// ---- Small helpers --------------------------------------------------------

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function fmtTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** A goal is "stuck" when it's active, not done, and its check-in has passed. */
export function isStuck(goal: Goal, now = Date.now()): boolean {
  return goal.state === "active" && !goal.done && goal.checkInAt != null && goal.checkInAt < now;
}

// ===========================================================================
// ADHDTaxTimeLogic — the 20% ADHD tax on transition time.
// Total_Duration × 1.2, then Go-Time = event start − buffered duration.
// ===========================================================================

export const ADHD_TAX_MULTIPLIER = 1.2; // ADHDTaxTimeLogic: the 20% tax

export function computeGoTime(eventAt: number, baseMinutes: number) {
  // ADHDTaxTimeLogic
  const bufferedMinutes = Math.round(baseMinutes * ADHD_TAX_MULTIPLIER);
  const goAt = eventAt - bufferedMinutes * 60_000;
  return { bufferedMinutes, goAt };
}

// ---- Shared read helpers (so Coach Bob's office can see the plan) ----------

export function loadGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(WINGMAN_STORAGE_KEY) || "{}");
    return Array.isArray(raw.goals) ? (raw.goals as Goal[]) : [];
  } catch {
    return [];
  }
}

/** Append a goal to the store, preserving everything else (alarms, etc.). */
export function addGoal(goal: Goal): void {
  if (typeof window === "undefined") return;
  try {
    const store = JSON.parse(localStorage.getItem(WINGMAN_STORAGE_KEY) || "{}");
    const next = {
      ...store,
      goals: [...(Array.isArray(store.goals) ? store.goals : []), goal],
      updatedAt: Date.now(),
    };
    localStorage.setItem(WINGMAN_STORAGE_KEY, JSON.stringify(next));
    pushUserData("wingman", next); // sync to the account (no-op when signed out)
    window.dispatchEvent(new Event(GOALS_EVENT)); // let the nav re-read
  } catch {
    /* ignore */
  }
}

/** How many goals are currently active (not done) — for the guardrail cap. */
export function activeGoalCount(): number {
  return loadGoals().filter((g) => g.state === "active" && !g.done).length;
}

/**
 * Build a Goal from Coach Bob's captured fields. If there's a first step and
 * room under the hard cap it lands in Active; otherwise it's parked in Drafts.
 */
export function goalFromCapture(input: {
  title: string;
  microAction?: string;
  outcome?: string;
  cadence?: string;
  type?: string;
}): Goal {
  const micro = (input.microAction || "").trim();
  const hasRoom = activeGoalCount() < ACTIVE_GOAL_HARD_CAP;
  return {
    id: newId(),
    title: input.title.trim(),
    microAction: micro,
    type: normalizeGoalType(input.type),
    state: micro && hasRoom ? "active" : "draft",
    done: false,
    createdAt: Date.now(),
    checkInAt: null,
    subTasks: [],
    outcome: input.outcome?.trim() || undefined,
    cadence: input.cadence?.trim() || undefined,
    logs: [],
  };
}

/** Compact, prompt-friendly summary of active goals for Coach Bob's context. */
export function goalsSummary(goals: Goal[]): string {
  const active = goals.filter((g) => g.state === "active" && !g.done);
  if (!active.length) return "";
  return active
    .map((g) => {
      const bits = [`- ${g.title}`];
      if (g.microAction) bits.push(`(first step: ${g.microAction})`);
      if (isStuck(g)) bits.push("[STUCK — missed check-in]");
      return bits.join(" ");
    })
    .join("\n");
}

// ===========================================================================
// PersonaConstraints + all Wingman copy.
// Edit strings here to retune the voice. Functions take data, return a line.
// ===========================================================================

export const WINGMAN = {
  // ---- PersonaConstraints -------------------------------------------------
  persona: {
    tagline: "Coach Bob here. Not a nag, not a therapist — the person in your corner who keeps you moving.",
    // Every interaction ends with a clear path to the next physical action.
    nextMoveNudge: "What's the move?",
    // CommitmentThresholdLogic guardrail copy
    atSoftCap: "You've got three going. That's the sweet spot — let's finish something before we add more.",
    atHardCap: "Four's the ceiling. Something has to close or pause before a new one opens. What are we finishing first?",
    goToOffice: "Talk to Coach Bob",
  },

  // ---- CommitmentThresholdLogic ------------------------------------------
  commitment: {
    heading: "New goal",
    titleLabel: "What are we actually going after?",
    titlePlaceholder: "e.g., Ship the pricing page",
    microLabel: "What's the ONE physical, low-activation step you can do for this today?",
    microPlaceholder: "e.g., open the file and write one ugly sentence",
    // Richer plan fields (optional) — outcome + cadence + logging.
    outcomeLabel: "What does DONE actually look like? (optional)",
    outcomePlaceholder: "e.g., pricing page live and shared with the team",
    cadenceLabel: "When / how often? (optional)",
    cadencePlaceholder: "e.g., Mon/Wed/Fri, 20 min before lunch",
    logCta: "Log progress",
    logPlaceholder: "What did you actually do?",
    logSaved: "Logged. That's the streak — receipts, not vibes.",
    loggedCount: (n: number) => `${n} logged`,
    rule: "Goals that can't name a first move don't get to sit in Active. That's the deal — it keeps this list honest.",
    ctaActive: "Lock it in →",
    ctaDraft: "No first move yet — park it in Drafts",
    draftedNote: "Parked in Drafts. No shame — come back when you've got one physical first step and I'll move it up.",
    activeNote: (micro: string) => `Good. Your only job today: ${micro}. Nothing else counts yet.`,
    draftsHeading: "Drafts — no first move yet",
    draftsEmpty: "Nothing parked. Clean.",
    promoteLabel: "Give it a first move",
  },

  // ---- CalibrationProtocol ------------------------------------------------
  calibration: {
    stuckBadge: "STUCK",
    stuckLine: "Looks like this task is stuck.",
    runAudit: "Let's check in",
    // The Barrier Audit question. Peer-to-peer, not clinical.
    auditQuestion: "Did your goals change, or is ADHD kicking your ass?",

    optionGoalsChanged: "My goals changed",
    optionAdhd: "ADHD's kicking my ass",

    // Branch: Goals Changed → re-negotiation (Edit / Pause / Delete)
    goalsChanged: {
      intro: "Cool. Goals move — that's not failure, that's data. What's the move?",
      edit: "Edit it",
      pause: "Pause it",
      delete: "Kill it",
      paused: "Paused. It's off your Active list and off your conscience. Un-pause when you're ready.",
    },

    // Branch: ADHD → Scaffolded Pivot (break down OR reschedule tomorrow)
    adhd: {
      intro: "Life happened, right? We don't force it — we shrink it. Pick one:",
      breakDown: "Break it into smaller steps",
      reschedule: "Push it to tomorrow",
      breakDownHint: "Drop 2–3 stupid-small steps. First one should take under two minutes.",
      subTaskPlaceholder: "e.g., just open the doc",
      addStep: "Add step",
      rescheduled: "Done — off your plate till tomorrow, 9:00. That's tomorrow-you's problem. Today-you is off the hook.",
      brokenDown: (first: string) => `Locked. Forget the rest — your next physical move is: ${first}.`,
    },
  },

  // ---- ADHDTaxTimeLogic ---------------------------------------------------
  adhdTax: {
    heading: "Go-Time math",
    blurb: "Tell me the event and how long the whole transition really takes — travel, prep, finding your keys. I'll add the tax.",
    labelEvent: "What & when",
    eventPlaceholder: "e.g., Dentist",
    labelBase: "Real transition time (min)",
    // Shown after the math runs.
    taxNote: (base: number, buffered: number) =>
      `${base} min of transition + the 20% ADHD tax = ${buffered} min of runway.`,
    result: (goTime: string) => `Based on our math, you need to start moving at ${goTime}.`,
    ask: "Should I set the departure alarm for then?",
    setAlarm: "Set the departure alarm",
    alarmSet: (goTime: string) => `Alarm's set for ${goTime}. When it goes off, you move — no "five more minutes."`,
    pastWarning: "That Go-Time is already behind us. Either you're moving right now, or we reschedule.",
    notifBlocked: "Alarm's saved in here, but your browser blocked notifications — keep this tab open, or flip notifications on to get the ping.",
  },
} as const;
