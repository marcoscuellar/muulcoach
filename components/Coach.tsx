"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MuulMarkVolt } from "@/components/icons";
import { muulComplete } from "@/lib/muul-client";
import { COACH_CHIPS } from "@/lib/prompts";
import { loadProfile, coachBobSystem, COACH_NAME, type Profile } from "@/lib/profile";
import {
  loadGoals,
  goalsSummary,
  addGoal,
  goalFromCapture,
  activeGoalCount,
  normalizeGoalType,
  ACTIVE_GOAL_HARD_CAP,
} from "@/lib/wingman";
import { pushUserData, SYNCED_EVENT, CHAT_STORAGE_KEY } from "@/lib/sync";

type Msg = { role: "coach" | "me"; text: string };
type GoalCapture = {
  title: string;
  microAction?: string;
  outcome?: string;
  cadence?: string;
  type?: string;
};

// Coach Bob proposes a goal by appending a hidden control block to his reply.
// We parse it out, hide it from the bubble, and offer to set the goal up.
// He fills out the whole "sheet" — including the goal type, which decides the
// tools the user gets in the sidebar.
const GOAL_PROTOCOL = `
GOAL SETUP:
Your job is to help the user identify a concrete goal and fill out the whole plan for them —
ask what they want, then propose the pieces so they don't face a blank form.
When you've landed on a goal together, append one control block at the VERY END, exactly:
[[GOAL]]{"title":"...","microAction":"...","outcome":"...","cadence":"...","type":"..."}[[/GOAL]]
- title: short, imperative name of the goal
- microAction: the ONE small physical first step (required — the low-activation move)
- outcome: what "done" looks like (optional; use "" if unknown)
- cadence: when/how often (optional; use "" if unknown)
- type: classify the goal's domain. Use "fitness" for exercise / health / movement / training
  goals; use "linkedin" for content / posting / professional-presence goals; use "generic" for
  anything else (learning, admin, creative, personal, etc.). Don't force a bad fit — "generic" is fine.
Rules: only include the block once you both agree on the goal. Never mention the block,
the brackets, or JSON in your visible sentence — it's a silent signal the app reads.
Write your normal coaching reply first, then the block on its own at the end.`;

function extractGoal(reply: string): { text: string; goal: GoalCapture | null } {
  const m = reply.match(/\[\[GOAL\]\]([\s\S]*?)\[\[\/GOAL\]\]/);
  if (!m) return { text: reply, goal: null };
  const text = reply.replace(m[0], "").trim();
  try {
    const parsed = JSON.parse(m[1].trim());
    if (parsed && typeof parsed.title === "string" && parsed.title.trim()) {
      return { text, goal: parsed as GoalCapture };
    }
  } catch {
    /* malformed — just strip it */
  }
  return { text, goal: null };
}

// Coach Bob's office — the back-and-forth. He adapts to the user's coaching
// profile and can see their active goals. Supports voice-to-text dictation.
// The conversation persists to localStorage so Coach Bob doesn't start over
// every time you leave the tab.

function loadChat(): Msg[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // New shape { messages, updatedAt }; tolerate the old bare-array shape.
    const arr = Array.isArray(parsed) ? parsed : parsed?.messages;
    return Array.isArray(arr) && arr.length ? (arr as Msg[]) : null;
  } catch {
    return null;
  }
}

function saveChat(messages: Msg[]) {
  try {
    const store = { messages, updatedAt: Date.now() };
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(store));
    pushUserData("chat", store); // sync to the account (no-op when signed out)
  } catch {
    /* ignore */
  }
}

function openingLine(profile: Profile | null): string {
  const name = profile?.name && profile.name !== "friend" ? `${profile.name}, ` : "";
  switch (profile?.style) {
    case "tough":
      return `${name}I'm not here to coddle you — I'm here to get you moving. What are we knocking out today?`;
    case "gentle":
      return `Hey ${name}no pressure. Let's just find one small thing you can actually do right now. What's on your plate?`;
    case "structured":
      return `${name}let's get organized. Tell me what you're working on and I'll help you build the next step into your day.`;
    default:
      return `${name}good to see you. What are we moving on today — and where are you stuck?`;
  }
}

export default function Coach() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [pendingGoal, setPendingGoal] = useState<GoalCapture | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Build Coach Bob's brain from the profile + current goals.
  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setSystemPrompt(coachBobSystem(p, goalsSummary(loadGoals())) + "\n" + GOAL_PROTOCOL);
    // Restore the saved conversation so Coach Bob picks up where you left off.
    const saved = loadChat();
    setMessages(saved ?? [{ role: "coach", text: openingLine(p) }]);

    // Voice-to-text (Web Speech API) — optional, best-effort.
    const SR = (typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) as any;
    if (SR) {
      setVoiceSupported(true);
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      rec.onresult = (e: any) => {
        const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recognitionRef.current = rec;
    }
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  // Persist the conversation on every change so it survives leaving the tab.
  // Only once there's a real user message — a fresh opening-line-only state
  // must not overwrite a real conversation syncing in from the account.
  useEffect(() => {
    if (messages.some((m) => m.role === "me")) saveChat(messages);
  }, [messages]);

  // If the account copy syncs in on load, adopt it (cross-device).
  useEffect(() => {
    const onSynced = () => {
      const saved = loadChat();
      if (saved) setMessages(saved);
    };
    window.addEventListener(SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(SYNCED_EVENT, onSynced);
  }, []);

  const resetChat = () => {
    const fresh: Msg[] = [{ role: "coach", text: openingLine(profile) }];
    setMessages(fresh);
    saveChat(fresh);
    setPendingGoal(null);
  };

  // Coach Bob captured a goal → create it in the Goals system and confirm.
  const confirmGoal = () => {
    if (!pendingGoal) return;
    const goal = goalFromCapture(pendingGoal);
    addGoal(goal);
    setSystemPrompt(coachBobSystem(profile, goalsSummary(loadGoals())) + "\n" + GOAL_PROTOCOL);

    let note: string;
    if (goal.state === "active") {
      note = `Locked in. "${goal.title}" is now active — your only job: ${goal.microAction}. It's on your Goals page.`;
    } else if (!goal.microAction) {
      note = `Parked "${goal.title}" in Drafts — it needs one physical first move before it goes Active. Find it on your Goals page.`;
    } else {
      note = `Your active list is full (${ACTIVE_GOAL_HARD_CAP}), so "${goal.title}" is parked in Drafts. Finish or pause one and I'll promote it.`;
    }
    setMessages((prev) => [...prev, { role: "coach", text: note }]);
    setPendingGoal(null);
  };

  const toggleVoice = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  };

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || thinking) return;
    const history: Msg[] = [...messages, { role: "me", text: msg }];
    setMessages(history);
    setInput("");
    setThinking(true);
    try {
      const apiMsgs = history.map((m) => ({
        role: (m.role === "coach" ? "assistant" : "user") as "assistant" | "user",
        content: m.text,
      }));
      const reply = await muulComplete({ system: systemPrompt, max_tokens: 400, messages: apiMsgs });
      const { text: replyText, goal } = extractGoal(reply);
      setMessages([...history, { role: "coach", text: replyText.trim() || "…" }]);
      if (goal) setPendingGoal(goal);
    } catch (e) {
      const text = e instanceof Error ? e.message : "Lost you for a second — say that again?";
      setMessages([...history, { role: "coach", text }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-[720px] flex-col gap-4 px-6 py-7">
      {/* Office header */}
      <div className="flex items-center gap-3 rounded-card border border-muted-line bg-surface px-4 py-3">
        <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-lg bg-ink">
          <MuulMarkVolt size={20} radius={5} />
        </div>
        <div className="min-w-0">
          <div className="font-coach text-[16px] font-extrabold uppercase tracking-[-0.01em]">{COACH_NAME}</div>
          <div className="font-mono text-[10px] tracking-[0.06em] text-muted-fog">
            {profile ? `${profile.style.toUpperCase()} · IN YOUR CORNER` : "IN YOUR CORNER"}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={resetChat} className="font-mono text-[11px] text-muted-fog hover:text-ink">
            NEW SESSION
          </button>
          <Link href="/goals" className="font-mono text-[11px] text-olive">
            VIEW THE PLAN →
          </Link>
        </div>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-[14px] overflow-y-auto pb-2">
        {messages.map((m, i) => {
          const isCoach = m.role === "coach";
          return (
            <div key={i} className={`flex animate-muulrise gap-[10px] ${isCoach ? "justify-start" : "justify-end"}`}>
              {isCoach && (
                <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg bg-ink">
                  <MuulMarkVolt size={16} radius={4} />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-[14px] px-[15px] py-3 text-[15px] leading-[1.5] ${
                  isCoach ? "rounded-tl-[4px] bg-ink text-onink" : "rounded-tr-[4px] border border-muted-line bg-surface text-ink"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        {thinking && (
          <div className="flex gap-[10px]">
            <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg bg-ink">
              <MuulMarkVolt size={16} radius={4} />
            </div>
            <div className="rounded-[14px] rounded-tl-[4px] bg-ink px-4 py-3 font-mono text-[12px] text-onink-faint">
              thinking…
            </div>
          </div>
        )}
      </div>

      {pendingGoal && (
        <div className="animate-muulrise rounded-card border-[1.5px] border-volt/30 bg-tint-coral px-4 py-[14px]">
          <div className="flex items-center justify-between gap-2">
            <div className="font-mono text-[10px] tracking-[0.08em] text-coral-text">SET THIS UP AS A GOAL?</div>
            <span className="rounded-full bg-ink px-2 py-[2px] font-mono text-[9px] uppercase tracking-[0.08em] text-onink">
              {normalizeGoalType(pendingGoal.type)}
            </span>
          </div>
          <div className="mt-1 font-display text-[15px] font-bold text-ink">{pendingGoal.title}</div>
          {pendingGoal.microAction && (
            <div className="mt-[3px] text-[13px] text-slate">First step: {pendingGoal.microAction}</div>
          )}
          {pendingGoal.outcome && <div className="text-[13px] text-slate">Done looks like: {pendingGoal.outcome}</div>}
          {pendingGoal.cadence && <div className="text-[13px] text-slate">Cadence: {pendingGoal.cadence}</div>}
          <div className="mt-3 flex gap-2">
            <button
              onClick={confirmGoal}
              className="rounded-[9px] border-none bg-volt px-4 py-2 font-display text-[13px] font-bold text-white"
            >
              Add to my goals
            </button>
            <button
              onClick={() => setPendingGoal(null)}
              className="rounded-[9px] border-[1.5px] border-muted-line bg-paper px-4 py-2 font-display text-[13px] font-semibold text-ink"
            >
              Not yet
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {COACH_CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => send(c)}
            className="rounded-[20px] border-[1.5px] border-muted-line bg-paper px-[13px] py-2 font-display text-[12px] font-semibold text-ink"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-[10px]">
        {voiceSupported && (
          <button
            onClick={toggleVoice}
            aria-label="dictate"
            title="Talk to Coach Bob"
            className={`flex h-[48px] w-[48px] flex-none items-center justify-center rounded-xl border-[1.5px] transition-colors ${
              listening ? "animate-pulse border-flare bg-flare text-paper" : "border-muted-line bg-paper text-ink"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0" />
              <line x1="12" y1="18" x2="12" y2="21" />
            </svg>
          </button>
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={listening ? "Listening… talk to me" : "Tell Coach Bob what's blocking you…"}
          className="max-h-[120px] min-h-[48px] flex-1 resize-none rounded-xl border-[1.5px] border-muted-line bg-paper px-[14px] py-[13px] text-[15px] text-ink"
        />
        <button
          onClick={() => send()}
          className="rounded-xl border-none bg-volt px-5 py-[14px] font-display text-[14px] font-bold text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}
