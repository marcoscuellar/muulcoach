"use client";

import { useRouter } from "next/navigation";

// Must match DEMO_COOKIE in lib/demo.ts. Kept as a local literal here because a
// client component can't import that module (it pulls in next/headers).
const DEMO_COOKIE = "cb_demo";

// Flips demo mode on/off by setting the cb_demo cookie, then refreshes so the
// server components re-render with sample vs. real/empty data.
export default function DemoToggle({ demo }: { demo: boolean }) {
  const router = useRouter();

  const toggle = () => {
    const next = demo ? "0" : "1";
    document.cookie = `${DEMO_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      title="Show sample data for demos"
      className="flex items-center justify-between rounded-[10px] border border-muted-line bg-surface px-3 py-[9px]"
    >
      <span className="font-mono text-[10px] tracking-[0.08em] text-muted-fog">DEMO MODE</span>
      <span
        className={`relative inline-flex h-[18px] w-[32px] flex-none items-center rounded-full transition-colors ${
          demo ? "bg-volt" : "bg-muted-soft"
        }`}
      >
        <span
          className={`inline-block h-[14px] w-[14px] rounded-full bg-white transition-transform ${
            demo ? "translate-x-[16px]" : "translate-x-[2px]"
          }`}
        />
      </span>
    </button>
  );
}
