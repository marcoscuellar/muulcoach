"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MuulMarkVolt } from "@/components/icons";
import { muulComplete } from "@/lib/muul-client";
import { COACH_CHIPS } from "@/lib/prompts";
import { loadProfile, coachBobSystem, COACH_NAME, type Profile } from "@/lib/profile";
import { loadGoals, goalsSummary } from "@/lib/wingman";

type Msg = { role: "coach" | "me"; text: string };

// Coach Bob's office — the back-and-forth. He adapts to the user's coaching
// profile and can see their active goals. Supports voice-to-text dictation.

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
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Build Coach Bob's brain from the profile + current goals.
  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setSystemPrompt(coachBobSystem(p, goalsSummary(loadGoals())));
    setMessages([{ role: "coach", text: openingLine(p) }]);

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
      setMessages([...history, { role: "coach", text: reply.trim() || "…" }]);
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
        <Link href="/goals" className="ml-auto font-mono text-[11px] text-olive">
          VIEW THE PLAN →
        </Link>
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
                className={`max-w-[80%] rounded-[14px] px-[15px] py-3 text-[15px] leading-[1.5] text-ink ${
                  isCoach ? "rounded-tl-[4px] border border-muted-line bg-surface" : "rounded-tr-[4px] bg-volt"
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
            <div className="rounded-[14px] rounded-tl-[4px] border border-muted-line bg-surface px-4 py-3 font-mono text-[12px] text-olive">
              thinking…
            </div>
          </div>
        )}
      </div>

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
          className="rounded-xl border-none bg-volt px-5 py-[14px] font-display text-[14px] font-bold text-ink"
        >
          Send
        </button>
      </div>
    </div>
  );
}
