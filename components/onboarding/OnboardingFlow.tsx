"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MuulMark } from "@/components/icons";
import {
  STYLES,
  CADENCES,
  COACH_NAME,
  saveProfile,
  type CoachStyle,
  type Cadence,
} from "@/lib/profile";

// First-run experience. Captures the name + HOW the user wants to be coached,
// so Coach Bob can adapt his delivery. Saved to the coaching profile.
// (This same UI slots onto real per-user accounts later — only storage changes.)

type Step = "welcome" | "style" | "cadence" | "name";

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [style, setStyle] = useState<CoachStyle | null>(null);
  const [cadence, setCadence] = useState<Cadence | null>(null);
  const [name, setName] = useState("");

  const finish = () => {
    saveProfile({
      name: name.trim() || "friend",
      style: style ?? "direct",
      cadence: cadence ?? "frequent",
      onboardedAt: Date.now(),
    });
    router.push("/");
  };

  const stepIndex = ["welcome", "style", "cadence", "name"].indexOf(step);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-5 py-10">
      <div className="w-full max-w-[560px]">
        {/* Progress */}
        <div className="mb-6 flex items-center gap-2">
          <MuulMark size={28} radius={8} />
          <span className="font-display text-[17px] font-bold tracking-[-0.02em]">Coach Bob</span>
          <div className="ml-auto flex gap-[6px]">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-[6px] w-[26px] rounded-full ${i <= stepIndex ? "bg-volt" : "bg-muted-line"}`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-panel border border-muted-line bg-paper p-8">
          {step === "welcome" && (
            <div>
              <div className="mb-2 font-mono text-[11px] tracking-[0.1em] text-olive">MEET YOUR COACH</div>
              <h1 className="font-coach text-[34px] font-black uppercase leading-[1.02] tracking-[-0.02em]">
                Hey — I&apos;m {COACH_NAME}.
              </h1>
              <p className="mt-3 text-[16px] leading-[1.5] text-muted-deep">
                I&apos;m your accountability coach. My job is simple:
              </p>
              <ul className="mt-3 flex flex-col gap-[10px]">
                {[
                  "Help you pick what actually matters",
                  "Build a real plan",
                  "Keep you moving — one physical step at a time",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[16px] leading-[1.4] text-muted-deep">
                    <span className="mt-[7px] h-[7px] w-[7px] flex-none rounded-full bg-volt" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[15px] font-semibold text-ink">Not a nag, not a therapist.</p>
              <p className="mt-3 text-[15px] leading-[1.5] text-muted-fog">
                First, two quick questions so I know how to coach you. Takes 20 seconds.
              </p>
              <button
                onClick={() => setStep("style")}
                className="mt-6 rounded-[11px] border-none bg-volt px-6 py-[13px] font-display text-[15px] font-bold text-white"
              >
                Let&apos;s go →
              </button>
            </div>
          )}

          {step === "style" && (
            <div>
              <div className="mb-2 font-mono text-[11px] tracking-[0.1em] text-olive">HOW SHOULD I COACH YOU?</div>
              <h2 className="mb-1 font-display text-[24px] font-bold tracking-[-0.02em]">
                What motivates you best?
              </h2>
              <p className="mb-5 text-[14px] text-muted-fog">
                I&apos;ll use this style when you&apos;re building momentum, feeling stuck, or getting back on track.
              </p>
              <div className="flex flex-col gap-[10px]">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`rounded-xl border-[1.5px] px-4 py-[14px] text-left transition-all ${
                      style === s.id ? "border-ink bg-ink text-paper" : "border-muted-line bg-paper text-ink hover:border-ink"
                    }`}
                  >
                    <div className="font-display text-[15px] font-semibold">{s.label}</div>
                    <div className={`text-[13px] ${style === s.id ? "text-onink-faint" : "text-muted-fog"}`}>
                      {s.blurb}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button onClick={() => setStep("welcome")} className="font-display text-[13px] font-semibold text-muted-fog">
                  ← Back
                </button>
                <button
                  onClick={() => setStep("cadence")}
                  disabled={!style}
                  className="rounded-[11px] border-none bg-volt px-6 py-[12px] font-display text-[14px] font-bold text-white disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === "cadence" && (
            <div>
              <div className="mb-2 font-mono text-[11px] tracking-[0.1em] text-olive">HOW OFTEN?</div>
              <h2 className="mb-5 font-display text-[24px] font-bold tracking-[-0.02em]">How much should I check in?</h2>
              <div className="flex flex-col gap-[10px]">
                {CADENCES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCadence(c.id)}
                    className={`rounded-xl border-[1.5px] px-4 py-[14px] text-left transition-all ${
                      cadence === c.id ? "border-ink bg-ink text-paper" : "border-muted-line bg-paper text-ink hover:border-ink"
                    }`}
                  >
                    <div className="font-display text-[15px] font-semibold">{c.label}</div>
                    <div className={`text-[13px] ${cadence === c.id ? "text-onink-faint" : "text-muted-fog"}`}>
                      {c.blurb}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button onClick={() => setStep("style")} className="font-display text-[13px] font-semibold text-muted-fog">
                  ← Back
                </button>
                <button
                  onClick={() => setStep("name")}
                  disabled={!cadence}
                  className="rounded-[11px] border-none bg-volt px-6 py-[12px] font-display text-[14px] font-bold text-white disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === "name" && (
            <div>
              <div className="mb-2 font-mono text-[11px] tracking-[0.1em] text-olive">LAST ONE</div>
              <h2 className="mb-5 font-display text-[24px] font-bold tracking-[-0.02em]">What should I call you?</h2>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && finish()}
                placeholder="Your first name"
                autoFocus
                className="w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-4 py-[13px] text-[16px] text-ink"
              />
              <div className="mt-6 flex items-center justify-between">
                <button onClick={() => setStep("cadence")} className="font-display text-[13px] font-semibold text-muted-fog">
                  ← Back
                </button>
                <button
                  onClick={finish}
                  className="rounded-[11px] border-none bg-volt px-6 py-[13px] font-display text-[15px] font-bold text-white"
                >
                  Meet {COACH_NAME} →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
