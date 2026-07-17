"use client";

import { useState } from "react";
import { WINGMAN, computeGoTime, fmtTime, newId, type DepartureAlarm } from "@/lib/wingman";

// ===========================================================================
// ADHDTaxTimeLogic — component
// Input an event + real transition time → apply the 20% tax → present Go-Time
// → offer to set the departure alarm.
// ===========================================================================

function toTodayMs(hhmm: string): number | null {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

export default function AdhdTax({ onSetAlarm }: { onSetAlarm: (a: DepartureAlarm) => void }) {
  const t = WINGMAN.adhdTax;
  const [label, setLabel] = useState("");
  const [time, setTime] = useState("");
  const [base, setBase] = useState(30);
  const [computed, setComputed] = useState<DepartureAlarm | null>(null);
  const [armed, setArmed] = useState(false);

  // ADHDTaxTimeLogic — run the math
  const run = () => {
    const eventAt = toTodayMs(time);
    if (eventAt == null || base <= 0) return;
    const { bufferedMinutes, goAt } = computeGoTime(eventAt, base);
    setComputed({
      id: newId(),
      label: label.trim() || "Event",
      eventAt,
      goAt,
      baseMinutes: base,
      bufferedMinutes,
    });
    setArmed(false);
  };

  const isPast = computed != null && computed.goAt < Date.now();

  const setAlarm = () => {
    if (!computed) return;
    onSetAlarm(computed);
    setArmed(true);
  };

  return (
    <div className="rounded-card border border-muted-line bg-paper p-6">
      <div className="mb-1 font-display text-[17px] font-semibold">{t.heading}</div>
      <p className="mb-4 text-[13px] leading-[1.5] text-muted-fog">{t.blurb}</p>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <div>
            <div className="mb-1 font-mono text-[10px] tracking-[0.06em] text-muted-fog">{t.labelEvent}</div>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t.eventPlaceholder}
              className="w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-3 py-[10px] text-[14px] text-ink"
            />
          </div>
          <div>
            <div className="mb-1 font-mono text-[10px] tracking-[0.06em] text-muted-fog">TIME</div>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-3 py-[10px] text-[14px] text-ink"
            />
          </div>
        </div>
        <div>
          <div className="mb-1 font-mono text-[10px] tracking-[0.06em] text-muted-fog">{t.labelBase}</div>
          <input
            type="number"
            min={1}
            value={base}
            onChange={(e) => setBase(Math.max(1, Number(e.target.value) || 0))}
            className="w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-3 py-[10px] text-[14px] text-ink"
          />
        </div>
        <button
          onClick={run}
          className="rounded-[10px] border-none bg-ink px-4 py-[11px] font-display text-[14px] font-bold text-paper"
        >
          Do the math
        </button>
      </div>

      {computed && (
        <div className="mt-5 animate-muulrise rounded-[14px] bg-ink p-5 text-onink">
          <div className="font-mono text-[10px] tracking-[0.06em] text-onink-faint">
            {t.taxNote(computed.baseMinutes, computed.bufferedMinutes)}
          </div>
          <div className="mt-2 font-display text-[22px] font-bold leading-[1.2] text-volt">
            {fmtTime(computed.goAt)}
          </div>
          <div className="mt-1 text-[14px] leading-[1.45]">
            {t.result(fmtTime(computed.goAt))}{" "}
            <span className="text-onink-faint">
              ({computed.label} at {fmtTime(computed.eventAt)})
            </span>
          </div>

          {isPast ? (
            <div className="mt-4 rounded-[10px] bg-[#3a2420] px-4 py-3 text-[13px] leading-[1.45] text-[#ffb9a3]">
              {t.pastWarning}
            </div>
          ) : armed ? (
            <div className="mt-4 flex items-center gap-2 rounded-[10px] bg-[#1e2a24] px-4 py-3 text-[13px] leading-[1.45] text-volt">
              <span>●</span> {t.alarmSet(fmtTime(computed.goAt))}
            </div>
          ) : (
            <>
              <div className="mt-4 text-[14px] font-semibold">{t.ask}</div>
              <button
                onClick={setAlarm}
                className="mt-3 rounded-[10px] border-none bg-volt px-4 py-[11px] font-display text-[14px] font-bold text-ink"
              >
                {t.setAlarm}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
