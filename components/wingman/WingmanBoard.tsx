"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  WINGMAN,
  WINGMAN_STORAGE_KEY,
  ACTIVE_GOAL_HARD_CAP,
  ACTIVE_GOAL_SOFT_CAP,
  newId,
  fmtTime,
  isStuck,
  type Goal,
  type DepartureAlarm,
} from "@/lib/wingman";
import { loadProfile, COACH_NAME, type Profile } from "@/lib/profile";
import { pushUserData, SYNCED_EVENT } from "@/lib/sync";
import GoalComposer from "./GoalComposer";
import GoalCard from "./GoalCard";
import CalibrationModal from "./CalibrationModal";
import AdhdTax from "./AdhdTax";

// ===========================================================================
// WingmanBoard — state owner for the ADHD co-pilot.
// Persists goals + departure alarms to localStorage. Wires the four modules:
// CommitmentThresholdLogic, CalibrationProtocol, ADHDTaxTimeLogic, Persona.
// ===========================================================================

type Persisted = { goals: Goal[]; alarms: DepartureAlarm[] };

function tomorrow9am(): number {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d.getTime();
}

export default function WingmanBoard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [alarms, setAlarms] = useState<DepartureAlarm[]>([]);
  const [auditing, setAuditing] = useState<Goal | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [capMsg, setCapMsg] = useState<string | null>(null);
  const [, forceTick] = useState(0);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // ---- Load persisted state --------------------------------------------
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(WINGMAN_STORAGE_KEY) || "{}") as Partial<Persisted>;
      if (Array.isArray(raw.goals)) setGoals(raw.goals);
      if (Array.isArray(raw.alarms)) setAlarms(raw.alarms);
    } catch {
      /* ignore */
    }
    setProfile(loadProfile());
    setHydrated(true);
  }, []);

  // ---- Persist (localStorage + account sync) ----------------------------
  useEffect(() => {
    if (!hydrated) return;
    const store = { goals, alarms, updatedAt: Date.now() };
    try {
      localStorage.setItem(WINGMAN_STORAGE_KEY, JSON.stringify(store));
    } catch {
      /* ignore */
    }
    pushUserData("wingman", store); // cross-device (no-op when signed out)
  }, [goals, alarms, hydrated]);

  // When the account copy is pulled in on load, adopt it into state.
  useEffect(() => {
    const reread = () => {
      try {
        const raw = JSON.parse(localStorage.getItem(WINGMAN_STORAGE_KEY) || "{}");
        if (Array.isArray(raw.goals)) setGoals(raw.goals);
        if (Array.isArray(raw.alarms)) setAlarms(raw.alarms);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener(SYNCED_EVENT, reread);
    return () => window.removeEventListener(SYNCED_EVENT, reread);
  }, []);

  // Re-evaluate "stuck" state on a slow interval so audits surface live.
  useEffect(() => {
    const int = setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => clearInterval(int);
  }, []);

  const patchGoal = useCallback((id: string, patch: Partial<Goal> | ((g: Goal) => Goal)) => {
    setGoals((gs) =>
      gs.map((g) => (g.id === id ? (typeof patch === "function" ? patch(g) : { ...g, ...patch }) : g)),
    );
  }, []);

  const activeCount = () => goals.filter((g) => g.state === "active" && !g.done).length;

  // ---- CommitmentThresholdLogic + goal guardrail -----------------------
  const createGoal = (title: string, microAction: string, outcome: string, cadence: string) => {
    const hasMicro = microAction.trim().length > 0;
    // Guardrail: never let the active list exceed the hard ceiling.
    if (hasMicro && activeCount() >= ACTIVE_GOAL_HARD_CAP) {
      setCapMsg(WINGMAN.persona.atHardCap);
      return;
    }
    const goal: Goal = {
      id: newId(),
      title,
      microAction: microAction.trim(),
      state: hasMicro ? "active" : "draft", // no first move => Draft (hidden from Active)
      done: false,
      createdAt: Date.now(),
      checkInAt: hasMicro ? endOfToday() : null,
      subTasks: [],
      outcome: outcome.trim() || undefined,
      cadence: cadence.trim() || undefined,
      logs: [],
    };
    setGoals((gs) => [goal, ...gs]);
    setCapMsg(hasMicro && activeCount() + 1 >= ACTIVE_GOAL_SOFT_CAP ? WINGMAN.persona.atSoftCap : null);
  };

  // Promote a Draft into Active by supplying its missing first move.
  const promoteDraft = (id: string, microAction: string) => {
    if (!microAction.trim()) return;
    if (activeCount() >= ACTIVE_GOAL_HARD_CAP) {
      setCapMsg(WINGMAN.persona.atHardCap);
      return;
    }
    patchGoal(id, { microAction: microAction.trim(), state: "active", checkInAt: endOfToday() });
  };

  // Progress logging — receipts that a goal actually got worked.
  const addLog = (id: string, note: string) =>
    patchGoal(id, (g) => ({
      ...g,
      logs: [{ id: newId(), at: Date.now(), note: note.trim() }, ...(g.logs ?? [])],
    }));

  // ---- CalibrationProtocol handlers ------------------------------------
  const pauseGoal = (id: string) => patchGoal(id, { state: "paused" });
  const resumeGoal = (id: string) => patchGoal(id, { state: "active", checkInAt: endOfToday() });
  const deleteGoal = (id: string) => setGoals((gs) => gs.filter((g) => g.id !== id));
  const editTitle = (id: string, title: string) => patchGoal(id, { title });
  const rescheduleTomorrow = (id: string) => patchGoal(id, { checkInAt: tomorrow9am() });
  const addSubtasks = (id: string, texts: string[]) =>
    patchGoal(id, (g) => ({
      ...g,
      // Scaffolded Pivot: reset the clock so the shrunk task isn't instantly "stuck".
      checkInAt: endOfToday(),
      subTasks: [...g.subTasks, ...texts.map((t) => ({ id: newId(), text: t, done: false }))],
    }));

  const toggleSub = (goalId: string, subId: string) =>
    patchGoal(goalId, (g) => ({
      ...g,
      subTasks: g.subTasks.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)),
    }));
  const toggleDone = (goalId: string) => patchGoal(goalId, (g) => ({ ...g, done: !g.done }));

  // ---- ADHDTaxTimeLogic: departure alarms ------------------------------
  const scheduleAlarm = useCallback((a: DepartureAlarm) => {
    const delay = a.goAt - Date.now();
    if (delay <= 0) return;
    if (timers.current[a.id]) clearTimeout(timers.current[a.id]);
    timers.current[a.id] = setTimeout(() => {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Wingman — Go-Time", { body: `Move now for ${a.label}. No "five more minutes."` });
      }
    }, delay);
  }, []);

  const addAlarm = (a: DepartureAlarm) => {
    setAlarms((prev) => [a, ...prev.filter((x) => x.goAt > Date.now())].slice(0, 6));
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    scheduleAlarm(a);
  };

  // Re-arm still-future alarms after a reload.
  useEffect(() => {
    if (!hydrated) return;
    alarms.forEach((a) => scheduleAlarm(a));
    const snapshot = timers.current;
    return () => Object.values(snapshot).forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const active = useMemo(() => goals.filter((g) => g.state === "active"), [goals]);
  const paused = useMemo(() => goals.filter((g) => g.state === "paused"), [goals]);
  const drafts = useMemo(() => goals.filter((g) => g.state === "draft"), [goals]);
  const stuckCount = active.filter((g) => isStuck(g) && !g.done).length;
  const upcomingAlarms = alarms.filter((a) => a.goAt > Date.now());

  return (
    <div className="flex flex-col gap-5 px-[34px] py-8">
      {/* Coach Bob intro */}
      <div className="rounded-panel border border-muted-line bg-ink p-6 text-onink">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[11px] tracking-[0.08em] text-white">COACH BOB · THE PLAN</div>
          <span className="font-mono text-[11px] text-onink-faint">
            {active.length}/{ACTIVE_GOAL_SOFT_CAP} active
          </span>
        </div>
        <p className="mt-2 max-w-[640px] text-[15px] leading-[1.5]">
          {profile?.name && profile.name !== "friend" ? `${profile.name} — ` : ""}
          {WINGMAN.persona.tagline} Three goals, max. Let&apos;s make them count.
        </p>
        {capMsg && (
          <div className="mt-3 rounded-[10px] bg-alert/15 px-4 py-2 text-[13px] leading-[1.4] text-alert-tint">
            {capMsg}
          </div>
        )}
        {stuckCount > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-alert/15 px-3 py-1 font-mono text-[11px] font-bold text-alert">
            {stuckCount} stuck · we should check in
          </div>
        )}
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-5 max-[1100px]:grid-cols-1">
        {/* Left: goals */}
        <div className="flex flex-col gap-5">
          <GoalComposer onCreate={createGoal} />

          <div className="flex flex-col gap-3">
            <div className="font-mono text-[11px] tracking-[0.08em] text-muted-fog">ACTIVE · {active.length}</div>
            {active.length === 0 && (
              <div className="rounded-card border border-dashed border-muted-soft p-6 text-[14px] text-muted-fog">
                Nothing active yet. Name a goal and its first physical move up top. {WINGMAN.persona.nextMoveNudge}
              </div>
            )}
            {active.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onRunAudit={setAuditing}
                onToggleSub={toggleSub}
                onToggleDone={toggleDone}
                onResume={resumeGoal}
                onLog={addLog}
              />
            ))}
          </div>

          {paused.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="font-mono text-[11px] tracking-[0.08em] text-muted-fog">PAUSED · {paused.length}</div>
              {paused.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  onRunAudit={setAuditing}
                  onToggleSub={toggleSub}
                  onToggleDone={toggleDone}
                  onResume={resumeGoal}
                  onLog={addLog}
                />
              ))}
            </div>
          )}

          {/* CommitmentThresholdLogic: Drafts are hidden from Active until they get a first move */}
          <DraftsSection drafts={drafts} onPromote={promoteDraft} onDelete={deleteGoal} />
        </div>

        {/* Right: ADHD tax tool + armed alarms */}
        <div className="flex flex-col gap-5">
          <AdhdTax onSetAlarm={addAlarm} />
          {upcomingAlarms.length > 0 && (
            <div className="rounded-card border border-muted-line bg-surface p-5">
              <div className="mb-3 font-mono text-[11px] tracking-[0.08em] text-muted-fog">DEPARTURE ALARMS</div>
              <div className="flex flex-col gap-2">
                {upcomingAlarms.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-ink">{a.label}</span>
                    <span className="font-mono text-[11px] text-olive">move at {fmtTime(a.goAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CalibrationProtocol modal */}
      {auditing && (
        <CalibrationModal
          goal={auditing}
          onClose={() => setAuditing(null)}
          onEditTitle={editTitle}
          onPause={pauseGoal}
          onDelete={deleteGoal}
          onReschedule={rescheduleTomorrow}
          onAddSubtasks={addSubtasks}
        />
      )}
    </div>
  );
}

function endOfToday(): number {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  return d.getTime();
}

// CommitmentThresholdLogic: Drafts list + inline "give it a first move" promotion.
function DraftsSection({
  drafts,
  onPromote,
  onDelete,
}: {
  drafts: Goal[];
  onPromote: (id: string, micro: string) => void;
  onDelete: (id: string) => void;
}) {
  const c = WINGMAN.commitment;
  return (
    <div className="flex flex-col gap-3">
      <div className="font-mono text-[11px] tracking-[0.08em] text-muted-fog">{c.draftsHeading.toUpperCase()}</div>
      {drafts.length === 0 ? (
        <div className="text-[13px] text-muted-sage">{c.draftsEmpty}</div>
      ) : (
        drafts.map((g) => <DraftRow key={g.id} goal={g} onPromote={onPromote} onDelete={onDelete} />)
      )}
    </div>
  );
}

function DraftRow({
  goal,
  onPromote,
  onDelete,
}: {
  goal: Goal;
  onPromote: (id: string, micro: string) => void;
  onDelete: (id: string) => void;
}) {
  const c = WINGMAN.commitment;
  const [open, setOpen] = useState(false);
  const [micro, setMicro] = useState("");
  return (
    <div className="rounded-card border border-dashed border-muted-soft bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-[15px] font-semibold text-slate">{goal.title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-[9px] border-[1.5px] border-ink bg-paper px-[12px] py-[6px] font-display text-[12px] font-semibold text-ink"
          >
            {c.promoteLabel}
          </button>
          <button onClick={() => onDelete(goal.id)} className="font-mono text-[13px] text-muted-fog">
            ×
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-3">
          <input
            value={micro}
            onChange={(e) => setMicro(e.target.value)}
            placeholder={c.microPlaceholder}
            className="w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-3 py-[10px] text-[14px] text-ink"
          />
          <button
            onClick={() => {
              onPromote(goal.id, micro);
              setMicro("");
              setOpen(false);
            }}
            disabled={!micro.trim()}
            className="mt-2 rounded-[10px] border-none bg-volt px-4 py-[9px] font-display text-[13px] font-bold text-white disabled:opacity-40"
          >
            {c.ctaActive}
          </button>
        </div>
      )}
    </div>
  );
}
