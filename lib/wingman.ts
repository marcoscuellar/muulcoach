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

export const WINGMAN_STORAGE_KEY = "muul-wingman-v1";

// ---- Types ----------------------------------------------------------------

export type SubTask = { id: string; text: string; done: boolean };
export type GoalState = "active" | "draft" | "paused";

export type Goal = {
  id: string;
  title: string;
  microAction: string; // "" while a goal is still a Draft
  state: GoalState;
  done: boolean;
  createdAt: number;
  checkInAt: number | null; // deadline / check-in timestamp (ms)
  subTasks: SubTask[];
};

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

// ===========================================================================
// PersonaConstraints + all Wingman copy.
// Edit strings here to retune the voice. Functions take data, return a line.
// ===========================================================================

export const WINGMAN = {
  // ---- PersonaConstraints -------------------------------------------------
  persona: {
    tagline: "Your Wingman. Not a nag, not a therapist — the person in your corner who keeps you moving.",
    // Every interaction ends with a clear path to the next physical action.
    nextMoveNudge: "What's the move?",
  },

  // ---- CommitmentThresholdLogic ------------------------------------------
  commitment: {
    heading: "New goal",
    titleLabel: "What are we actually going after?",
    titlePlaceholder: "e.g., Ship the pricing page",
    microLabel: "What's the ONE physical, low-activation step you can do for this today?",
    microPlaceholder: "e.g., open the file and write one ugly sentence",
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
