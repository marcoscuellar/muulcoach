"use client";

import { useEffect, useRef, useState } from "react";
import { MuulMarkVolt } from "@/components/icons";
import { muulComplete } from "@/lib/muul-client";
import { coachSys, COACH_CHIPS, DEFAULT_FIELD } from "@/lib/prompts";

type Msg = { role: "coach" | "me"; text: string };

const OPENING: Msg = {
  role: "coach",
  text: "You said you’d position yourself as the go-to expert this month. You’re on a 12-day streak — let’s protect it. What are you posting today?",
};

export default function Coach() {
  const [messages, setMessages] = useState<Msg[]>([OPENING]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

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
      const reply = await muulComplete({ system: coachSys(DEFAULT_FIELD), max_tokens: 400, messages: apiMsgs });
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
                  isCoach
                    ? "rounded-tl-[4px] border border-muted-line bg-surface"
                    : "rounded-tr-[4px] bg-volt"
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
              coaching…
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
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Tell your coach what's blocking you…"
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
