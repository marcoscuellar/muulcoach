"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { WINGMAN, type Goal } from "@/lib/wingman";

// ===========================================================================
// CalibrationProtocol — component (the "Barrier Audit")
// Fires when a task is stuck. Asks ONE peer-to-peer question, then branches:
//   - "Goals changed"  → re-negotiation flow (Edit / Pause / Delete)
//   - "ADHD"           → Scaffolded Pivot (break into sub-tasks OR reschedule)
// Tone rule: no therapy-speak. Ends on a concrete next physical action.
// ===========================================================================

type Step = "audit" | "goalsChanged" | "editing" | "adhd" | "breakdown";

export default function CalibrationModal({
  goal,
  onClose,
  onEditTitle,
  onPause,
  onDelete,
  onReschedule,
  onAddSubtasks,
}: {
  goal: Goal;
  onClose: () => void;
  onEditTitle: (id: string, title: string) => void;
  onPause: (id: string) => void;
  onDelete: (id: string) => void;
  onReschedule: (id: string) => void;
  onAddSubtasks: (id: string, texts: string[]) => void;
}) {
  const k = WINGMAN.calibration;
  const [step, setStep] = useState<Step>("audit");
  const [title, setTitle] = useState(goal.title);
  const [steps, setSteps] = useState<string[]>([""]);

  if (typeof document === "undefined") return null;

  const updateStep = (i: number, v: string) => setSteps((s) => s.map((x, j) => (j === i ? v : x)));
  const addStepField = () => setSteps((s) => [...s, ""]);
  const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);

  const commitBreakdown = () => {
    if (!cleanSteps.length) return;
    onAddSubtasks(goal.id, cleanSteps); // CalibrationProtocol: Scaffolded Pivot → sub-tasks
    onClose();
  };

  return createPortal(
    <div onClick={onClose} className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] animate-modalPop overflow-hidden rounded-panel border border-muted-line bg-paper shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-muted-line px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-alert/15 px-[10px] py-1 font-mono text-[10px] font-bold tracking-[0.08em] text-alert">
              {k.stuckBadge}
            </span>
            <span className="font-display text-[15px] font-semibold">{goal.title}</span>
          </div>
          <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md border border-muted-line text-[14px] leading-none text-muted-fog">
            ×
          </button>
        </div>

        <div className="p-5">
          {/* ---- Step: the Barrier Audit question ---- */}
          {step === "audit" && (
            <div>
              <div className="text-[13px] text-muted-fog">{k.stuckLine}</div>
              <div className="mt-1 font-display text-[19px] font-semibold leading-[1.3]">{k.auditQuestion}</div>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => setStep("goalsChanged")}
                  className="rounded-[10px] border-[1.5px] border-ink bg-paper px-4 py-3 text-left font-display text-[14px] font-semibold text-ink"
                >
                  {k.optionGoalsChanged}
                </button>
                <button
                  onClick={() => setStep("adhd")}
                  className="rounded-[10px] border-none bg-ink px-4 py-3 text-left font-display text-[14px] font-bold text-paper"
                >
                  {k.optionAdhd}
                </button>
              </div>
            </div>
          )}

          {/* ---- Branch: Goals Changed → re-negotiation ---- */}
          {step === "goalsChanged" && (
            <div>
              <div className="mb-4 text-[14px] leading-[1.45] text-ink">{k.goalsChanged.intro}</div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setStep("editing")}
                  className="rounded-[10px] border-[1.5px] border-muted-line bg-paper px-4 py-3 text-left font-display text-[14px] font-semibold text-ink"
                >
                  {k.goalsChanged.edit}
                </button>
                <button
                  onClick={() => {
                    onPause(goal.id); // CalibrationProtocol: re-negotiation → pause
                    onClose();
                  }}
                  className="rounded-[10px] border-[1.5px] border-muted-line bg-paper px-4 py-3 text-left font-display text-[14px] font-semibold text-ink"
                >
                  {k.goalsChanged.pause}
                </button>
                <button
                  onClick={() => {
                    onDelete(goal.id); // CalibrationProtocol: re-negotiation → delete
                    onClose();
                  }}
                  className="rounded-[10px] border-[1.5px] border-alert/40 bg-alert/10 px-4 py-3 text-left font-display text-[14px] font-semibold text-alert"
                >
                  {k.goalsChanged.delete}
                </button>
              </div>
            </div>
          )}

          {step === "editing" && (
            <div>
              <div className="mb-2 font-mono text-[10px] tracking-[0.06em] text-muted-fog">RENAME / RE-SCOPE</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-3 py-[11px] text-[15px] text-ink"
              />
              <button
                onClick={() => {
                  if (title.trim()) onEditTitle(goal.id, title.trim());
                  onClose();
                }}
                className="mt-4 rounded-[10px] border-none bg-volt px-4 py-[11px] font-display text-[14px] font-bold text-ink"
              >
                Save & keep going →
              </button>
            </div>
          )}

          {/* ---- Branch: ADHD → Scaffolded Pivot ---- */}
          {step === "adhd" && (
            <div>
              <div className="mb-4 text-[14px] leading-[1.45] text-ink">{k.adhd.intro}</div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setStep("breakdown")}
                  className="rounded-[10px] border-none bg-ink px-4 py-3 text-left font-display text-[14px] font-bold text-paper"
                >
                  {k.adhd.breakDown}
                </button>
                <button
                  onClick={() => {
                    onReschedule(goal.id); // CalibrationProtocol: Scaffolded Pivot → reschedule tomorrow
                    onClose();
                  }}
                  className="rounded-[10px] border-[1.5px] border-muted-line bg-paper px-4 py-3 text-left font-display text-[14px] font-semibold text-ink"
                >
                  {k.adhd.reschedule}
                </button>
              </div>
              <div className="mt-3 text-[12px] leading-[1.5] text-muted-fog">{k.adhd.rescheduled}</div>
            </div>
          )}

          {step === "breakdown" && (
            <div>
              <div className="mb-3 text-[13px] leading-[1.45] text-muted-fog">{k.adhd.breakDownHint}</div>
              <div className="flex flex-col gap-2">
                {steps.map((s, i) => (
                  <input
                    key={i}
                    value={s}
                    onChange={(e) => updateStep(i, e.target.value)}
                    placeholder={i === 0 ? k.adhd.subTaskPlaceholder : `Step ${i + 1}`}
                    className="w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-3 py-[10px] text-[14px] text-ink"
                  />
                ))}
              </div>
              <button
                onClick={addStepField}
                className="mt-2 font-display text-[12px] font-semibold text-olive"
              >
                {k.adhd.addStep} +
              </button>
              <button
                onClick={commitBreakdown}
                disabled={!cleanSteps.length}
                className="mt-4 block w-full rounded-[10px] border-none bg-volt px-4 py-[11px] font-display text-[14px] font-bold text-ink disabled:opacity-40"
              >
                {cleanSteps.length ? k.adhd.brokenDown(cleanSteps[0]) : "Add at least one step"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
