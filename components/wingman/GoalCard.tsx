"use client";

import { useState } from "react";
import { WINGMAN, isStuck, fmtTime, type Goal } from "@/lib/wingman";

// Presentational card for an active/paused goal. Surfaces the micro-action,
// sub-tasks, and — when the check-in has slipped — the CalibrationProtocol entry.

function checkInLabel(goal: Goal): { text: string; stuck: boolean } {
  if (goal.checkInAt == null) return { text: "No check-in set", stuck: false };
  const stuck = isStuck(goal);
  const d = new Date(goal.checkInAt);
  const day = d.toLocaleDateString([], { weekday: "short" });
  return { text: `Check-in ${day} ${fmtTime(goal.checkInAt)}`, stuck };
}

export default function GoalCard({
  goal,
  onRunAudit,
  onToggleSub,
  onToggleDone,
  onResume,
  onLog,
}: {
  goal: Goal;
  onRunAudit: (goal: Goal) => void;
  onToggleSub: (goalId: string, subId: string) => void;
  onToggleDone: (goalId: string) => void;
  onResume: (goalId: string) => void;
  onLog: (goalId: string, note: string) => void;
}) {
  const k = WINGMAN.calibration;
  const c = WINGMAN.commitment;
  const ci = checkInLabel(goal);
  const paused = goal.state === "paused";
  const [logging, setLogging] = useState(false);
  const [note, setNote] = useState("");
  const logCount = goal.logs?.length ?? 0;

  const submitLog = () => {
    onLog(goal.id, note.trim() || "did the thing");
    setNote("");
    setLogging(false);
  };

  return (
    <div
      className={`rounded-card border bg-paper p-5 ${
        ci.stuck ? "border-alert/50" : "border-muted-line"
      } ${goal.done || paused ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {ci.stuck && (
              <span className="inline-block rounded-full bg-alert/15 px-[8px] py-[2px] font-mono text-[9px] font-bold tracking-[0.08em] text-alert">
                {k.stuckBadge}
              </span>
            )}
            {paused && (
              <span className="inline-block rounded-full bg-muted-line px-[8px] py-[2px] font-mono text-[9px] font-bold tracking-[0.08em] text-slate">
                PAUSED
              </span>
            )}
            <span className={`font-display text-[16px] font-semibold ${goal.done ? "line-through" : ""}`}>
              {goal.title}
            </span>
          </div>
          {goal.microAction && (
            <div className="mt-1 text-[13px] leading-[1.45] text-muted-fog">
              <span className="font-mono text-[10px] tracking-[0.06em] text-olive">FIRST MOVE · </span>
              {goal.microAction}
            </div>
          )}
          {goal.outcome && (
            <div className="mt-[3px] text-[13px] leading-[1.45] text-muted-fog">
              <span className="font-mono text-[10px] tracking-[0.06em] text-muted-sage">DONE = </span>
              {goal.outcome}
            </div>
          )}
          {goal.cadence && (
            <div className="mt-[3px] text-[13px] leading-[1.45] text-muted-fog">
              <span className="font-mono text-[10px] tracking-[0.06em] text-muted-sage">CADENCE · </span>
              {goal.cadence}
            </div>
          )}
        </div>
        <button
          onClick={() => onToggleDone(goal.id)}
          aria-label="toggle done"
          className={`mt-[2px] flex h-6 w-6 flex-none items-center justify-center rounded-md border-[1.5px] text-[13px] ${
            goal.done ? "border-verified bg-verified text-ink" : "border-muted-soft text-transparent"
          }`}
        >
          ✓
        </button>
      </div>

      {/* Sub-tasks (from a Scaffolded Pivot break-down) */}
      {goal.subTasks.length > 0 && (
        <div className="mt-3 flex flex-col gap-[6px]">
          {goal.subTasks.map((s) => (
            <button
              key={s.id}
              onClick={() => onToggleSub(goal.id, s.id)}
              className="flex items-center gap-[10px] text-left text-[13.5px] text-ink"
            >
              <span
                className={`flex h-[18px] w-[18px] flex-none items-center justify-center rounded border-[1.5px] text-[11px] ${
                  s.done ? "border-verified bg-verified text-ink" : "border-muted-soft text-transparent"
                }`}
              >
                ✓
              </span>
              <span className={s.done ? "text-muted-fog line-through" : ""}>{s.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Progress logging */}
      {!paused && !goal.done && (
        <div className="mt-3">
          {logging ? (
            <div className="flex items-center gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitLog()}
                placeholder={c.logPlaceholder}
                autoFocus
                className="flex-1 rounded-[9px] border-[1.5px] border-muted-line bg-paper px-3 py-[8px] text-[13px] text-ink"
              />
              <button
                onClick={submitLog}
                className="rounded-[9px] border-none bg-olive px-3 py-[8px] font-display text-[12px] font-bold text-paper"
              >
                Log it
              </button>
            </div>
          ) : (
            <button
              onClick={() => setLogging(true)}
              className="font-display text-[12px] font-semibold text-olive"
            >
              + {c.logCta}
              {logCount > 0 && <span className="ml-2 font-mono text-[10px] text-muted-sage">{c.loggedCount(logCount)}</span>}
            </button>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className={`font-mono text-[10px] tracking-[0.06em] ${ci.stuck ? "text-alert" : "text-muted-sage"}`}>
          {ci.text}
        </span>
        {paused ? (
          <button
            onClick={() => onResume(goal.id)}
            className="rounded-[9px] border-[1.5px] border-ink bg-paper px-[13px] py-[7px] font-display text-[12px] font-semibold text-ink"
          >
            Resume
          </button>
        ) : ci.stuck && !goal.done ? (
          // CalibrationProtocol entry point
          <button
            onClick={() => onRunAudit(goal)}
            className="rounded-[9px] border-none bg-alert px-[14px] py-[7px] font-display text-[12px] font-bold text-paper"
          >
            {k.runAudit}
          </button>
        ) : null}
      </div>
    </div>
  );
}
