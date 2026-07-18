import Link from "next/link";
import { TRENDS, NEWS, type Trend, type NewsItem } from "@/lib/data";

export const dynamic = "force-static";

function trendHref(t: Trend) {
  const idea = `Trending on LinkedIn: "${t.topic}". My take:`;
  return `/composer?idea=${encodeURIComponent(idea)}&angle=${t.angle}`;
}
function newsHref(n: NewsItem) {
  const idea = `News: "${n.headline}". My angle: ${n.angle}`;
  return `/composer?idea=${encodeURIComponent(idea)}&angle=${n.a}`;
}

function momoClass(kind: "hot" | "up") {
  return kind === "hot" ? "bg-tint-coral text-coral-text" : "bg-tint-mint text-olive-deep";
}
function catClass(kind: NewsItem["kind"]) {
  if (kind === "ai") return "bg-volt text-white";
  if (kind === "security") return "bg-tint-coral text-coral-text";
  return "bg-[#2A3A5C] text-[#C4CEDE]";
}

const DraftBtn = ({ href }: { href: string }) => (
  <Link
    href={href}
    className="whitespace-nowrap rounded-[9px] border-none bg-volt px-[15px] py-[9px] font-display text-[12px] font-bold text-white"
  >
    Draft a take →
  </Link>
);

export default function TrendingPage() {
  // Static shell shows "today"; a real feed would refresh daily (see backend notes).
  const trends = TRENDS.today;
  return (
    <div className="flex flex-col gap-5 px-[34px] py-8">
      {/* Trending */}
      <div className="rounded-panel border border-muted-line p-[26px]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="font-mono text-[11px] tracking-[0.08em] text-olive">TRENDING ON LINKEDIN</div>
            <div className="mt-1 text-[13px] text-muted-fog">Scoped to your field — jump on it in your voice</div>
          </div>
          <div className="flex gap-2">
            <span className="rounded-[9px] border-[1.5px] border-ink bg-ink px-[15px] py-2 font-display text-[13px] font-semibold text-paper">
              Today
            </span>
            <span className="rounded-[9px] border-[1.5px] border-muted-line bg-paper px-[15px] py-2 font-display text-[13px] font-semibold text-ink">
              This week
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-[10px]">
          {trends.map((t, i) => (
            <div key={i} className="flex items-center gap-[14px] rounded-[13px] border border-muted-line px-4 py-[13px]">
              <span
                className={`min-w-[52px] flex-shrink-0 rounded-lg px-[9px] py-[5px] text-center font-mono text-[11px] font-bold ${momoClass(t.kind)}`}
              >
                {t.momo}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[15px] font-semibold">{t.topic}</div>
                <div className="mt-[2px] font-mono text-[10px] text-muted-fog">{t.meta}</div>
              </div>
              <DraftBtn href={trendHref(t)} />
            </div>
          ))}
        </div>
      </div>

      {/* Daily Brief */}
      <div className="rounded-panel border border-muted-line bg-ink p-[26px]">
        <div className="mb-[6px] flex items-center justify-between">
          <div className="font-mono text-[11px] tracking-[0.08em] text-white">THE DAILY BRIEF</div>
          <span className="font-mono text-[10px] text-onink-faint">WED · JULY 16</span>
        </div>
        <div className="mb-[18px] font-display text-[20px] font-bold tracking-[-0.02em] text-[#EEF1F6]">
          Today&apos;s news, ready to post about
        </div>
        <div className="flex flex-col gap-[10px]">
          {NEWS.map((n, i) => (
            <div key={i} className="flex items-center gap-[14px] rounded-[13px] border border-[#2A3A5C] bg-[#16233F] px-4 py-[13px]">
              <span
                className={`min-w-[66px] flex-shrink-0 rounded-[7px] px-[9px] py-1 text-center font-mono text-[9px] font-bold tracking-[0.05em] ${catClass(n.kind)}`}
              >
                {n.cat}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[15px] font-semibold text-onink">{n.headline}</div>
                <div className="mt-[3px] text-[12px] leading-[1.4] text-onink-faint">Angle: {n.angle}</div>
              </div>
              <DraftBtn href={newsHref(n)} />
            </div>
          ))}
        </div>
      </div>
      <div className="font-mono text-[11px] leading-[1.5] text-muted-sage">
        Live trends and news are pulled each morning and filtered to your field and target buyer.
      </div>
    </div>
  );
}
