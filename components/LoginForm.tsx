"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { MuulMark } from "@/components/icons";

// Magic-link sign-in. Enter email → Resend sends a one-tap login link.
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || state === "sending") return;
    setState("sending");
    try {
      const res = await signIn("resend", { email: email.trim(), redirect: false, callbackUrl: "/" });
      setState(res?.error ? "error" : "sent");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-5 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex items-center gap-2">
          <MuulMark size={30} radius={8} />
          <span className="font-display text-[19px] font-bold tracking-[-0.02em]">Muul</span>
        </div>

        <div className="rounded-panel border border-muted-line bg-paper p-8">
          {state === "sent" ? (
            <div>
              <div className="mb-2 font-mono text-[11px] tracking-[0.1em] text-olive">CHECK YOUR EMAIL</div>
              <h1 className="font-coach text-[26px] font-black uppercase leading-[1.05] tracking-[-0.02em]">
                Link sent.
              </h1>
              <p className="mt-3 text-[15px] leading-[1.5] text-muted-deep">
                We sent a one-tap login link to <span className="font-semibold">{email}</span>. Open it on this device
                and you&apos;re in. (Check spam if it&apos;s hiding.)
              </p>
              <button
                onClick={() => setState("idle")}
                className="mt-5 font-display text-[13px] font-semibold text-olive"
              >
                ← Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="mb-2 font-mono text-[11px] tracking-[0.1em] text-olive">SIGN IN</div>
              <h1 className="font-coach text-[26px] font-black uppercase leading-[1.05] tracking-[-0.02em]">
                Let&apos;s get to work.
              </h1>
              <p className="mt-3 text-[15px] leading-[1.5] text-muted-deep">
                Drop your email — Coach Bob sends a login link, no password to remember.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-5 w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-4 py-[13px] text-[16px] text-ink"
              />
              {state === "error" && (
                <div className="mt-3 rounded-[10px] bg-flare/10 px-3 py-2 text-[13px] text-coral-text">
                  Couldn&apos;t send that link. Double-check the email and try again.
                </div>
              )}
              <button
                type="submit"
                disabled={state === "sending"}
                className="mt-5 w-full rounded-[11px] border-none bg-volt px-6 py-[13px] font-display text-[15px] font-bold text-ink disabled:opacity-50"
              >
                {state === "sending" ? "Sending…" : "Send my login link →"}
              </button>
            </form>
          )}
        </div>
        <p className="mt-4 text-center font-mono text-[10px] tracking-[0.06em] text-muted-sage">
          YOUR GOALS, YOUR DATA — PRIVATE TO YOU
        </p>
      </div>
    </div>
  );
}
