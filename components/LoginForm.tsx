"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MuulMark } from "@/components/icons";

// Email + password sign-in / account creation.
type Mode = "signin" | "signup";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finishSignedIn = async () => {
    const res = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("That email and password don't match. Try again.");
      setBusy(false);
      return;
    }
    router.push("/");
    router.refresh();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);

    if (mode === "signup") {
      try {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, name: name.trim() }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Couldn't create that account.");
          setBusy(false);
          return;
        }
      } catch {
        setError("Something went wrong. Try again.");
        setBusy(false);
        return;
      }
    }

    try {
      await finishSignedIn();
    } catch {
      setError("Something went wrong. Try again.");
      setBusy(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-5 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex items-center gap-2">
          <MuulMark size={30} radius={8} />
          <span className="font-display text-[19px] font-bold tracking-[-0.02em]">Coach Bob</span>
        </div>

        <div className="rounded-panel border border-muted-line bg-paper p-8">
          <div className="mb-2 font-mono text-[11px] tracking-[0.1em] text-olive">
            {mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
          </div>
          <h1 className="font-coach text-[26px] font-black uppercase leading-[1.05] tracking-[-0.02em]">
            {mode === "signin" ? "Let's get to work." : "Let's set you up."}
          </h1>
          <p className="mt-3 text-[15px] leading-[1.5] text-muted-deep">
            {mode === "signin"
              ? "Sign in with your email and password."
              : "Pick a password and you're in — no email link needed."}
          </p>

          <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
            {mode === "signup" && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your first name"
                autoComplete="given-name"
                className="w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-4 py-[13px] text-[16px] text-ink"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              className="w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-4 py-[13px] text-[16px] text-ink"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "Create a password (8+ characters)" : "Your password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full rounded-[10px] border-[1.5px] border-muted-line bg-paper px-4 py-[13px] text-[16px] text-ink"
            />

            {error && (
              <div className="rounded-[10px] bg-flare/10 px-3 py-2 text-[13px] text-coral-text">{error}</div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 w-full rounded-[11px] border-none bg-volt px-6 py-[13px] font-display text-[15px] font-bold text-white disabled:opacity-50"
            >
              {busy
                ? mode === "signin"
                  ? "Signing in…"
                  : "Creating account…"
                : mode === "signin"
                  ? "Sign in →"
                  : "Create account →"}
            </button>
          </form>

          <div className="mt-5 text-[13px] text-muted-fog">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <button onClick={() => switchMode("signup")} className="font-semibold text-coral-text">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => switchMode("signin")} className="font-semibold text-coral-text">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
        <p className="mt-4 text-center font-mono text-[10px] tracking-[0.06em] text-muted-sage">
          YOUR GOALS, YOUR DATA — PRIVATE TO YOU
        </p>
      </div>
    </div>
  );
}
