import Link from "next/link";
import { MuulMarkVolt } from "@/components/icons";
import Tag from "@/components/Tag";
import { STREAK_DAYS, UP_NEXT, HOME_HEAT } from "@/lib/data";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-[22px] px-[34px] py-8">
      {/* Stat row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-card bg-ink p-5">
          <div className="font-mono text-[10px] tracking-[0.06em] text-onink-faint">STREAK</div>
          <div className="mt-[6px] font-display text-[38px] font-bold leading-[1.1] text-volt">{STREAK_DAYS}</div>
          <div className="text-[12px] text-onink-faint">days in a row</div>
        </div>
        <div className="rounded-card border border-muted-line bg-surface p-5">
          <div className="font-mono text-[10px] tracking-[0.06em] text-muted-fog">THIS WEEK</div>
          <div className="mt-[6px] font-display text-[38px] font-bold leading-[1.1]">
            3<span className="text-[20px] text-muted-sage">/4</span>
          </div>
          <div className="text-[12px] text-muted-fog">posts published</div>
        </div>
        <div className="rounded-card border border-muted-line bg-surface p-5">
          <div className="font-mono text-[10px] tracking-[0.06em] text-muted-fog">AVG REACH</div>
          <div className="mt-[6px] font-display text-[38px] font-bold leading-[1.1] text-olive">+218%</div>
          <div className="text-[12px] text-muted-fog">vs. 12 weeks ago</div>
        </div>
        <div className="rounded-card border border-muted-line bg-surface p-5">
          <div className="font-mono text-[10px] tracking-[0.06em] text-muted-fog">NEXT POST</div>
          <div className="mt-[10px] font-display text-[26px] font-bold leading-[1.15]">Thu 9:00</div>
          <div className="text-[12px] text-muted-fog">SME: 3 myths in my field</div>
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
          <div className="flex flex-col gap-3">
            {UP_NEXT.map((item, i) => {
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
                        item.statusKind === "scheduled" ? "text-olive" : "text-muted-sage"
                      }`}
                    >
                      {item.status}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-card bg-ink p-[22px]">
            <div className="mb-3 flex items-center gap-[9px]">
              <MuulMarkVolt />
              <span className="font-mono text-[11px] text-volt">COACH</span>
            </div>
            <p className="m-0 mb-4 text-[15px] leading-[1.5] text-onink">
              You&apos;re one post ahead of last week — nice. Lock Friday&apos;s pitch now and you&apos;ll hit your
              monthly goal early.
            </p>
            <Link
              href="/coach"
              className="inline-block rounded-[10px] border-none bg-volt px-4 py-[9px] font-display text-[13px] font-bold text-ink"
            >
              Talk to coach
            </Link>
          </div>
          <div className="rounded-card border border-muted-line bg-surface p-[22px]">
            <div className="mb-[14px] font-mono text-[11px] text-muted-fog">CONSISTENCY · 6 WKS</div>
            <div className="grid grid-cols-6 gap-[6px]">
              {HOME_HEAT.map((op, i) => (
                <span
                  key={i}
                  className="rounded-[4px]"
                  style={{ aspectRatio: "1", background: `rgba(196,245,66,${op})` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
