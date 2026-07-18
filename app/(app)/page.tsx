import Link from "next/link";
import Tag from "@/components/Tag";
import CoachBobHomeCard from "@/components/CoachBobHomeCard";
import EmptyState from "@/components/EmptyState";
import { STREAK_DAYS, UP_NEXT, HOME_HEAT } from "@/lib/data";
import { isDemo } from "@/lib/demo";

export default function HomePage() {
  const demo = isDemo();
  const upNext = demo ? UP_NEXT : [];
  const homeHeat = demo ? HOME_HEAT : [];

  return (
    <div className="flex flex-col gap-[22px] px-[34px] py-8">
      {/* Stat row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-card bg-ink p-5">
          <div className="font-mono text-[10px] tracking-[0.06em] text-onink-faint">STREAK</div>
          <div className="mt-[6px] font-display text-[38px] font-bold leading-[1.1] text-white">
            {demo ? STREAK_DAYS : 0}
          </div>
          <div className="text-[12px] text-onink-faint">days in a row</div>
        </div>
        <div className="rounded-card border border-muted-line bg-surface p-5">
          <div className="font-mono text-[10px] tracking-[0.06em] text-muted-fog">THIS WEEK</div>
          <div className="mt-[6px] font-display text-[38px] font-bold leading-[1.1]">
            {demo ? 3 : 0}
            <span className="text-[20px] text-muted-sage">/4</span>
          </div>
          <div className="text-[12px] text-muted-fog">posts published</div>
        </div>
        <div className="rounded-card border border-muted-line bg-surface p-5">
          <div className="font-mono text-[10px] tracking-[0.06em] text-muted-fog">AVG REACH</div>
          <div className="mt-[6px] font-display text-[38px] font-bold leading-[1.1] text-olive">
            {demo ? "+218%" : "—"}
          </div>
          <div className="text-[12px] text-muted-fog">{demo ? "vs. 12 weeks ago" : "no data yet"}</div>
        </div>
        <div className="rounded-card border border-muted-line bg-surface p-5">
          <div className="font-mono text-[10px] tracking-[0.06em] text-muted-fog">NEXT POST</div>
          <div className="mt-[10px] font-display text-[26px] font-bold leading-[1.15]">{demo ? "Thu 9:00" : "—"}</div>
          <div className="text-[12px] text-muted-fog">
            {demo ? "SME: 3 myths in my field" : "nothing scheduled"}
          </div>
        </div>
      </div>

      {/* Up next + coach/consistency */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-4">
        <div className="rounded-card border border-muted-line bg-paper p-6">
          <div className="mb-[18px] flex items-center justify-between">
            <span className="font-display text-[17px] font-semibold">Up next</span>
            <Link href="/calendar" className="font-mono text-[11px] text-olive">
              VIEW CALENDAR →
            </Link>
          </div>
          {upNext.length === 0 ? (
            <div className="rounded-xl border border-dashed border-muted-soft bg-surface px-4 py-10 text-center">
              <div className="text-[14px] font-semibold text-ink">Nothing queued yet</div>
              <p className="mt-1 text-[13px] text-muted-fog">Draft your first post and it shows up here.</p>
              <Link
                href="/composer"
                className="mt-3 inline-block rounded-[9px] bg-volt px-3 py-2 font-display text-[12px] font-bold text-white"
              >
                Draft a post →
              </Link>
            </div>
          ) : (
          <div className="flex flex-col gap-3">
            {upNext.map((item, i) => {
              const dashed = item.action === "draft";
              return (
                <div
                  key={i}
                  className={`flex items-center gap-[14px] rounded-xl border p-[14px] ${
                    dashed ? "border-dashed border-muted-soft" : "border-muted-line"
                  } ${item.statusKind === "idea" ? "opacity-70" : ""}`}
                >
                  <div className="w-[56px] whitespace-pre font-mono text-[11px] text-muted-fog">{item.when}</div>
                  <div className="flex-1">
                    <div className={`text-[15px] font-semibold ${dashed ? "text-slate" : ""}`}>{item.title}</div>
                    <div className="mt-[5px]">
                      <Tag kind={item.tagKind}>{item.tag}</Tag>
                    </div>
                  </div>
                  {item.action === "draft" ? (
                    <Link
                      href="/composer"
                      className="rounded-[9px] border-[1.5px] border-ink bg-paper px-[13px] py-[7px] font-display text-[12px] font-semibold text-ink"
                    >
                      Draft it
                    </Link>
                  ) : (
                    <span
                      className={`font-mono text-[10px] ${
                        item.statusKind === "scheduled" ? "text-verified-deep" : "text-muted-sage"
                      }`}
                    >
                      {item.status}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <CoachBobHomeCard />
          <div className="rounded-card border border-muted-line bg-surface p-[22px]">
            <div className="mb-[14px] font-mono text-[11px] text-muted-fog">CONSISTENCY · 6 WKS</div>
            {homeHeat.length === 0 ? (
              <p className="text-[13px] leading-[1.5] text-muted-fog">
                No activity yet — this grid fills in as you post.
              </p>
            ) : (
              <div className="grid grid-cols-6 gap-[6px]">
                {homeHeat.map((op, i) => (
                  <span
                    key={i}
                    className="rounded-[4px]"
                    style={{ aspectRatio: "1", background: `rgba(140,47,61,${op})` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
