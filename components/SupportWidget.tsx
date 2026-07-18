"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

// "We Got You" — regulation / body-double panel. Ported from the design's
// standalone widget and wired into the app top bar. Persists {mode, techIndex,
// offload} to localStorage['dos-support-widget-v1'].

const BRAND = "#1B1B1D";
const STORAGE_KEY = "dos-support-widget-v1";

type Resource = { name: string; url: string; note: string };
type Technique = {
  type: "timed" | "physical" | "write";
  title: string;
  body: string;
  seconds?: number;
  tip?: string;
  resources?: Resource[];
};

const TECHNIQUES: Technique[] = [
  { type: "timed", title: "2-minute rule", body: "If the next move takes under two minutes, do it now instead of queuing it.", seconds: 120 },
  { type: "timed", title: "Timebox it", body: "Set the timer for one narrow task. Stop when it rings, even mid-sentence.", seconds: 1500 },
  {
    type: "physical",
    title: "Body doubling",
    body: "Work alongside someone else — even silently. Here are places that run all day and let anyone join:",
    tip: "Just open one, turn your camera on if you want, and keep working.",
    resources: [
      { name: "Focusmate", url: "https://focusmate.com", note: "best overall — 50-min sessions, 24/7, free tier" },
      { name: "Flown", url: "https://flown.com", note: "calm virtual co-working rooms" },
      { name: "Caveday", url: "https://caveday.org", note: "structured all-day virtual coworking" },
      { name: "YouTube / Twitch", url: "", note: 'search "body doubling" or "silent co-working live"' },
    ],
  },
  { type: "physical", title: "Move for 90 seconds", body: "Stand up, walk to another room, shake it out. It resets more than it costs." },
  { type: "write", title: "Write the worst sentence.", body: "Any sentence, however bad. That's the whole ask." },
];

// [id, label, techIndex, line]
const MODES: [string, string, number, string][] = [
  ["fog", "Fog", 3, "Slow down. Body first, brain follows."],
  ["scattered", "Scattered", 0, "Small and fast beats big and stalled."],
  ["clear", "Clear", 1, "Good window. Protect it with a hard stop."],
  ["lockedin", "Locked In", 2, "Borrow someone else's focus to hold yours."],
  ["avoiding", "Avoiding", 4, "No fixing yet. Just get one bad sentence down."],
];

type Offload = { id: number; text: string };

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("scattered");
  const [techIndex, setTechIndex] = useState(0);
  const [sillyOpen, setSillyOpen] = useState(false);
  const [offload, setOffload] = useState<Offload[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [timerRemaining, setTimerRemaining] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load persisted state once on mount.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved.mode) setMode(saved.mode);
      if (typeof saved.techIndex === "number") {
        setTechIndex(saved.techIndex);
        const secs = TECHNIQUES[saved.techIndex]?.seconds;
        if (secs) {
          setTimerSeconds(secs);
          setTimerRemaining(secs);
        }
      }
      if (Array.isArray(saved.offload)) setOffload(saved.offload);
    } catch {
      /* ignore */
    }
    setHydrated(true);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Persist whenever the durable bits change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, techIndex, offload }));
    } catch {
      /* ignore */
    }
  }, [mode, techIndex, offload, hydrated]);

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const applyTech = (idx: number) => {
    stopTimer();
    setTechIndex(idx);
    setSillyOpen(false);
    setTimerRunning(false);
    const secs = TECHNIQUES[idx].seconds;
    if (secs) {
      setTimerSeconds(secs);
      setTimerRemaining(secs);
    }
  };

  const pickMode = (id: string, idx: number) => {
    setMode(id);
    applyTech(idx);
  };

  const cycleTechnique = () => applyTech((techIndex + 1) % TECHNIQUES.length);

  const timerToggle = () => {
    if (timerRunning) {
      stopTimer();
      setTimerRunning(false);
      return;
    }
    if (timerRemaining <= 0) return;
    setTimerRunning(true);
    intervalRef.current = setInterval(() => {
      setTimerRemaining((r) => {
        if (r <= 1) {
          stopTimer();
          setTimerRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const timerReset = () => {
    stopTimer();
    setTimerRemaining(timerSeconds);
    setTimerRunning(false);
  };

  const addOffload = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const text = e.currentTarget.value.trim();
    if (!text) return;
    setOffload((o) => [...o, { id: Date.now(), text }]);
    e.currentTarget.value = "";
  };
  const removeOffload = (id: number) => setOffload((o) => o.filter((x) => x.id !== id));

  const tech = TECHNIQUES[techIndex % TECHNIQUES.length];
  const modeEntry = MODES.find((m) => m[0] === mode) ?? MODES[1];
  const durationLabel = tech.seconds
    ? tech.seconds >= 60
      ? `${Math.round(tech.seconds / 60)} min`
      : `${tech.seconds}s`
    : null;
  const mm = Math.floor(timerRemaining / 60);
  const ss = timerRemaining % 60;
  const timerDisplay = `${mm}:${String(ss).padStart(2, "0")}`;
  const timerBtnLabel = timerRunning ? "Pause" : timerRemaining === 0 ? "Done" : "Start";
  const progress = Math.round((1 - timerRemaining / (timerSeconds || 1)) * 360);
  const tint = `${BRAND}14`;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex select-none items-center gap-[6px] rounded-full border px-[14px] py-[7px] font-mono text-[11px] font-bold uppercase tracking-[0.06em] transition-all"
        style={{
          background: open ? "#1B1B1D" : "transparent",
          color: open ? "#ffffff" : "#1B1B1D",
          borderColor: open ? "#1B1B1D" : "rgba(0,0,0,0.2)",
        }}
      >
        <span>{open ? "●" : "○"}</span> We Got You
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] animate-backdropIn bg-black/30"
          >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 right-[clamp(16px,4vw,32px)] top-[clamp(20px,8vh,90px)] w-[min(460px,calc(100vw-32px))] animate-modalPop overflow-y-auto rounded-[20px] border border-black/[0.08] bg-white text-[#0a0a0a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]"
            style={{ fontFamily: "var(--font-instrument-sans), system-ui, sans-serif" }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-black/[0.12] px-[18px] py-[14px]">
              <span className="font-mono text-[16px] font-bold uppercase tracking-[0.06em] text-[#0a0a0a]">
                We got you
              </span>
              <span className="ml-auto mr-2 font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-black/40">
                Powered by DOS
              </span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-6 w-6 flex-none items-center justify-center rounded-md border border-black/[0.15] text-[14px] leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-[18px]">
              <div className="mb-[9px] font-mono text-[9px] uppercase tracking-[0.14em] text-black/50">
                Where&apos;s your head at right now?
              </div>
              <div className="flex flex-wrap gap-[6px]">
                {MODES.map(([id, label, idx]) => {
                  const sel = mode === id;
                  return (
                    <button
                      key={id}
                      onClick={() => pickMode(id, idx)}
                      className="rounded-full border px-[15px] py-2 text-[13px] font-medium transition-all"
                      style={{
                        borderColor: sel ? "#0a0a0a" : "rgba(0,0,0,.2)",
                        background: sel ? "#0a0a0a" : "transparent",
                        color: sel ? "#fff" : "rgba(0,0,0,.7)",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-black/10 pt-4">
                <div className="mb-1 text-[13px] leading-[1.4] text-black/55">{modeEntry[3]}</div>
                <div className="text-[19px] font-semibold tracking-[-0.015em]">{tech.title}</div>
                <div className="mt-[6px] text-[14px] leading-[1.45] text-black/65">{tech.body}</div>
                {tech.resources && tech.tip && (
                  <div className="mt-[6px] text-[12.5px] italic text-black/50">{tech.tip}</div>
                )}

                {durationLabel && (
                  <div className="mt-4 flex items-center gap-[14px] rounded-[14px] bg-[#0a0a0a] p-4 text-white">
                    <div
                      className="flex flex-none items-center justify-center rounded-full"
                      style={{
                        width: 92,
                        height: 92,
                        background: `conic-gradient(#ECE6DA ${progress}deg, rgba(255,255,255,.16) 0deg)`,
                      }}
                    >
                      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#0a0a0a] text-[18px] font-semibold tabular-nums text-white">
                        {timerDisplay}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <button
                        onClick={timerToggle}
                        className="rounded-lg border-none bg-volt px-5 py-[14px] text-[16px] font-semibold text-white"
                        style={{ fontFamily: "var(--font-instrument-sans)" }}
                      >
                        {timerBtnLabel} {durationLabel}
                      </button>
                      <button
                        onClick={timerReset}
                        className="rounded-lg border-[1.5px] border-white/35 bg-transparent px-5 py-[14px] text-[16px] font-semibold text-white"
                        style={{ fontFamily: "var(--font-instrument-sans)" }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}

                {tech.resources && (
                  <div className="mt-[14px] flex flex-col gap-2">
                    {tech.resources.map((r) => (
                      <div key={r.name} className="text-[13.5px] leading-[1.4]">
                        {r.url ? (
                          <a href={r.url} target="_blank" rel="noreferrer" className="font-semibold">
                            {r.name}
                          </a>
                        ) : (
                          <span className="font-semibold">{r.name}</span>
                        )}
                        <span className="text-black/55"> — {r.note}</span>
                      </div>
                    ))}
                  </div>
                )}

                {tech.type === "write" && (
                  <div className="mt-[14px]">
                    <button
                      onClick={() => setSillyOpen((s) => !s)}
                      className="rounded-lg border-none bg-[#0a0a0a] px-5 py-[14px] text-[16px] font-semibold text-white"
                      style={{ fontFamily: "var(--font-instrument-sans)" }}
                    >
                      I wrote it →
                    </button>
                  </div>
                )}
                {sillyOpen && (
                  <div
                    className="mt-[14px] px-[14px] py-3 text-[13.5px] leading-[1.4]"
                    style={{ background: tint, border: `1.5px dashed ${BRAND}` }}
                  >
                    Good. Now rewrite it as ridiculous as you can — the freeze breaks faster than the fix
                    does.
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={cycleTechnique}
                    className="rounded-full border border-black/20 px-3 py-[6px] font-mono text-[10px] uppercase tracking-[0.1em] text-black/55"
                  >
                    Try another →
                  </button>
                </div>
              </div>

              <div
                className="mt-4 flex items-center gap-[10px] rounded-xl px-4 py-[14px]"
                style={{ background: tint, border: `1.5px solid ${BRAND}` }}
              >
                <span className="font-mono text-[16px] font-bold" style={{ color: BRAND }}>
                  +
                </span>
                <input
                  onKeyDown={addOffload}
                  placeholder="One thought, then let go."
                  className="flex-1 border-none bg-transparent text-[16px] font-medium tracking-[-0.01em] text-[#0a0a0a] outline-none"
                />
              </div>

              {offload.length > 0 && (
                <div className="mt-[10px] flex flex-col gap-[6px]">
                  {offload.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-start gap-[9px] text-[13.5px] leading-[1.4] text-black/80"
                    >
                      <span className="mt-[2px] font-mono text-[11px] text-black/40">—</span>
                      <span className="flex-1">{o.text}</span>
                      <button
                        onClick={() => removeOffload(o.id)}
                        className="cursor-pointer px-[6px] py-[1px] font-mono text-[11px] text-black/40"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>,
          document.body,
        )}
    </>
  );
}
