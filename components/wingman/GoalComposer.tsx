"use client";

import { useState } from "react";
import { WINGMAN } from "@/lib/wingman";

// ===========================================================================
// CommitmentThresholdLogic — component
// A new goal REQUIRES a physical, low-activation micro-action.
//   - micro-action present  → goal enters "active"
//   - micro-action missing   → goal is forced into "draft" (hidden from Active)
// Logic rule: goals must be actionable to exist in the active workspace.
// ===========================================================================

export default function GoalComposer({
  onCreate,
}: {
  onCreate: (title: string, microAction: string, outcome: string, cadence: string) => void; // micro "" => Draft
}) {
  const c = WINGMAN.commitment;
  const [title, setTitle] = useState("");
  const [micro, setMicro] = useState("");
  const [outcome, setOutcome] = useState("");
  const [cadence, setCadence] = useState("");

  const canSave = title.trim().length > 0;
  const hasMicro = micro.trim().length > 0;

  const submit = (asDraft: boolean) => {
    if (!canSave) return;
    // CommitmentThresholdLogic: no micro-action (or explicit draft) => Draft state.
    onCreate(title.trim(), asDraft ? "" : micro.trim(), outcome, cadence);
    setTitle("");
    setMicro("");
    setOutcome("");
    setCadence("");
  };

  return (
    <div className="rounded-card border border-muted-line bg-paper p-6">
      <div className="mb-4 font-display text-[17px] font-semibold">{c.heading}</div>

      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1 font-mono text-[10px] tracking-[0.06em] text-muted-fog">{c.titleLabel}</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={c.titlePlaceholder}
            className="w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-3 py-[11px] text-[15px] text-ink"
          />
        </div>

        {/* CommitmentThresholdLogic: the mandatory first-move input */}
        <div>
          <div className="mb-1 font-mono text-[10px] tracking-[0.06em] text-olive">{c.microLabel}</div>
          <textarea
            value={micro}
            onChange={(e) => setMicro(e.target.value)}
            placeholder={c.microPlaceholder}
            className="min-h-[64px] w-full resize-y rounded-[10px] border-[1.5px] border-muted-line bg-paper px-3 py-[11px] text-[15px] leading-[1.45] text-ink"
          />
          <div className="mt-2 text-[12px] leading-[1.5] text-muted-fog">{c.rule}</div>
        </div>

        {/* Optional plan fields: the outcome + the cadence */}
        <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
          <div>
            <div className="mb-1 font-mono text-[10px] tracking-[0.06em] text-muted-fog">{c.outcomeLabel}</div>
            <input
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder={c.outcomePlaceholder}
              className="w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-3 py-[10px] text-[14px] text-ink"
            />
          </div>
          <div>
            <div className="mb-1 font-mono text-[10px] tracking-[0.06em] text-muted-fog">{c.cadenceLabel}</div>
            <input
              value={cadence}
              onChange={(e) => setCadence(e.target.value)}
              placeholder={c.cadencePlaceholder}
              className="w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-3 py-[10px] text-[14px] text-ink"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => submit(false)}
            disabled={!canSave || !hasMicro}
            className="rounded-[10px] border-none bg-volt px-4 py-[11px] font-display text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {c.ctaActive}
          </button>
          <button
            onClick={() => submit(true)}
            disabled={!canSave}
            className="font-display text-[13px] font-semibold text-muted-fog underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            {c.ctaDraft}
          </button>
        </div>
      </div>
    </div>
  );
}
