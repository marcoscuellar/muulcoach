"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ComposeIcon } from "@/components/icons";
import { muulComplete } from "@/lib/muul-client";
import { ANGLES, REFINES, DEFAULT_FIELD, DEFAULT_AUTHOR_NAME, DEFAULT_AUTHOR_TITLE, writerSys } from "@/lib/prompts";

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "YN";
}

export default function Composer() {
  const params = useSearchParams();
  const [angle, setAngle] = useState("authority");
  const [idea, setIdea] = useState("");
  const [field, setField] = useState(DEFAULT_FIELD);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const schedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seeded = useRef(false);

  // Seed idea/angle from a Trending or Calendar "Draft a take" link.
  useEffect(() => {
    if (seeded.current) return;
    const seedIdea = params.get("idea");
    const seedAngle = params.get("angle");
    if (seedIdea) setIdea(seedIdea);
    if (seedAngle && ANGLES.some((a) => a.id === seedAngle)) setAngle(seedAngle);
    seeded.current = true;
  }, [params]);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
      if (schedTimer.current) clearTimeout(schedTimer.current);
    };
  }, []);

  const generate = async () => {
    if (loading) return;
    if (!idea.trim()) {
      setError("Add a thought first — even a few words.");
      return;
    }
    const a = ANGLES.find((x) => x.id === angle)!;
    setLoading(true);
    setError("");
    setCopied(false);
    setScheduled(false);
    try {
      const text = await muulComplete({
        system: writerSys(field),
        max_tokens: 800,
        messages: [{ role: "user", content: `Write a LinkedIn post.\n\nAngle: ${a.brief}\n\nMy raw idea: "${idea.trim()}"` }],
      });
      setDraft(text.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Coach Bob couldn’t draft that just now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const refine = async (instr: string) => {
    if (loading || !draft) return;
    setLoading(true);
    setError("");
    setCopied(false);
    setScheduled(false);
    try {
      const text = await muulComplete({
        system: writerSys(field),
        max_tokens: 800,
        messages: [
          { role: "user", content: `Here is my current LinkedIn post:\n\n"""\n${draft}\n"""\n\n${instr}\n\nReturn ONLY the revised post.` },
        ],
      });
      setDraft(text.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Coach Bob couldn’t revise that just now. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    try {
      navigator.clipboard.writeText(draft);
    } catch {
      /* ignore */
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1600);
  };
  const schedule = () => {
    setScheduled(true);
    if (schedTimer.current) clearTimeout(schedTimer.current);
    schedTimer.current = setTimeout(() => setScheduled(false), 2000);
  };

  const hasDraft = !!draft && !loading;
  const showEmpty = !hasDraft && !loading;
  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const statusLabel = loading ? "DRAFTING" : hasDraft ? "READY TO POST" : "DRAFT";

  return (
    <div className="grid h-full grid-cols-[400px_1fr]">
      {/* Left: controls */}
      <div className="flex flex-col gap-6 overflow-y-auto border-r border-muted-line p-7">
        <div>
          <div className="mb-2 font-mono text-[11px] tracking-[0.1em] text-olive">STEP 01</div>
          <div className="font-display text-[19px] font-semibold">Pick your angle</div>
        </div>
        <div className="grid grid-cols-2 gap-[10px]">
          {ANGLES.map((a) => {
            const sel = a.id === angle;
            return (
              <button
                key={a.id}
                onClick={() => setAngle(a.id)}
                className={`rounded-xl border-[1.5px] p-[13px] text-left transition-all ${
                  sel ? "border-ink bg-ink text-paper" : "border-muted-line bg-paper text-ink"
                }`}
              >
                <span className="mb-[3px] block font-display text-[14px] font-semibold">{a.label}</span>
                <span className="block text-[11px] leading-[1.35]">{a.desc}</span>
              </button>
            );
          })}
        </div>
        <div>
          <div className="mb-2 font-mono text-[11px] tracking-[0.1em] text-olive">STEP 02</div>
          <div className="mb-3 font-display text-[19px] font-semibold">What&apos;s on your mind?</div>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="A rough thought, a client win, a lesson, a hot take. Coach Bob turns it into a post that sounds like you."
            className="min-h-[140px] w-full resize-y rounded-xl border-[1.5px] border-muted-line bg-paper p-[14px] text-[15px] leading-[1.5] text-ink"
          />
        </div>
        <div>
          <div className="mb-2 font-mono text-[11px] text-muted-fog">YOUR FIELD</div>
          <input
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-[13px] py-[11px] text-[14px] text-ink"
          />
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="mt-auto rounded-xl border-none px-[15px] py-[15px] font-display text-[16px] font-bold text-ink"
          style={{ background: loading ? "#FFE0DB" : "#FF6B5C", cursor: loading ? "default" : "pointer" }}
        >
          {loading ? "Coach Bob is drafting…" : draft ? "Draft a fresh version" : "Draft my post"}
        </button>
      </div>

      {/* Right: LinkedIn preview */}
      <div className="flex justify-center overflow-y-auto bg-surface p-9">
        <div className="w-full max-w-[540px]">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[11px] text-muted-fog">LINKEDIN PREVIEW</span>
            <span
              className={`rounded-[20px] px-[10px] py-1 font-mono text-[11px] font-bold tracking-[0.06em] ${
                hasDraft ? "bg-tint-mint text-olive-deep" : "bg-surface text-muted-fog"
              }`}
            >
              {statusLabel}
            </span>
          </div>
          <div className="overflow-hidden rounded-card border border-muted-line bg-paper shadow-[0_18px_44px_-30px_rgba(16,23,26,0.45)]">
            <div className="flex items-center gap-3 px-5 py-[18px]">
              <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-ink font-display text-[17px] font-bold text-volt">
                {initials(DEFAULT_AUTHOR_NAME)}
              </div>
              <div>
                <div className="font-display text-[15px] font-semibold">{DEFAULT_AUTHOR_NAME}</div>
                <div className="text-[13px] text-muted-fog">{DEFAULT_AUTHOR_TITLE}</div>
                <div className="mt-[1px] font-mono text-[11px] text-muted-sage">now · edited by Coach Bob</div>
              </div>
            </div>
            <div className="relative min-h-[180px] px-5 pb-2">
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/85">
                  <div className="h-[34px] w-[34px] animate-muulspin rounded-full border-[3px] border-tint-mint border-t-olive" />
                  <span className="font-mono text-[12px] text-olive">COACH BOB IS DRAFTING…</span>
                </div>
              )}
              {hasDraft && (
                <div className="animate-muulrise whitespace-pre-wrap text-[15px] leading-[1.62] text-ink">{draft}</div>
              )}
              {showEmpty && (
                <div className="flex flex-col items-center justify-center px-5 py-[34px] text-center text-muted-sage">
                  <ComposeIcon size={34} className="mb-[14px]" style={{ stroke: "#c1c9b5", strokeWidth: 1.6 }} />
                  <div className="max-w-[260px] text-[14px] leading-[1.5]">
                    Pick an angle, drop in a thought, and Coach Bob writes the post for you.
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-[18px] border-t border-[#EEF1F6] px-5 py-3 text-[13px] text-muted-sage">
              <span>Like</span>
              <span>Comment</span>
              <span>Repost</span>
              <span>Send</span>
            </div>
          </div>

          {hasDraft && (
            <div className="mt-5">
              <div className="mb-3 font-mono text-[11px] text-olive">COACH BOB, MAKE IT…</div>
              <div className="flex flex-wrap gap-[10px]">
                {REFINES.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => refine(r.instr)}
                    className="rounded-[10px] border-[1.5px] border-muted-line bg-paper px-[15px] py-[9px] font-display text-[13px] font-semibold text-ink"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="mt-[18px] flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted-sage">
                  {words} WORDS · {draft.length} CHARS
                </span>
                <div className="flex gap-[10px]">
                  <button
                    onClick={copy}
                    className="rounded-[10px] border-[1.5px] border-muted-line bg-paper px-4 py-[10px] font-display text-[13px] font-semibold text-ink"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={schedule}
                    className="rounded-[10px] border-none bg-ink px-5 py-[10px] font-display text-[13px] font-bold text-paper"
                  >
                    {scheduled ? "Scheduled ✓" : "Schedule"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-[18px] rounded-xl border border-[#FFCFC8] bg-[#FFE0DB] p-[14px] text-[14px] text-coral-text">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
