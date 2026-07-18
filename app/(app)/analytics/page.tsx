import EmptyState from "@/components/EmptyState";
import { POSTS_PER_WEEK, REACH_BY_TYPE, ANALYTICS_HEAT } from "@/lib/data";
import { isDemo } from "@/lib/demo";

export default function AnalyticsPage() {
  if (!isDemo()) {
    return (
      <div className="px-[34px] py-8">
        <EmptyState
          title="No analytics yet"
          sub="Post something and Coach Bob starts tracking your reach, consistency, and what's working — it all shows up here."
          cta={{ href: "/composer", label: "Draft a post" }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-[34px] py-8">
      {/* Engagement line + consistency heatmap */}
      <div className="grid grid-cols-[1.3fr_1fr] gap-4">
        <div className="rounded-card border border-muted-line bg-paper p-6">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="font-display text-[17px] font-semibold">Engagement</span>
            <span className="font-mono text-[11px] text-olive">+218% / 12 WK</span>
          </div>
          <div className="mb-[18px] font-mono text-[11px] text-muted-fog">IMPRESSIONS PER POST</div>
          <svg viewBox="0 0 520 200" width="100%" className="block overflow-visible">
            <defs>
              <linearGradient id="appArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8C2F3D" stopOpacity="0.35" />
                <stop offset="1" stopColor="#8C2F3D" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="50" x2="520" y2="50" stroke="#E3E7EE" strokeWidth="1" />
            <line x1="0" y1="100" x2="520" y2="100" stroke="#E3E7EE" strokeWidth="1" />
            <line x1="0" y1="150" x2="520" y2="150" stroke="#E3E7EE" strokeWidth="1" />
            <path
              d="M0 165 L65 150 L130 158 L195 120 L260 128 L325 88 L390 70 L455 48 L520 26 L520 200 L0 200 Z"
              fill="url(#appArea)"
            />
            <polyline
              points="0 165 65 150 130 158 195 120 260 128 325 88 390 70 455 48 520 26"
              fill="none"
              stroke="#1B2A4A"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="520" cy="26" r="4.5" fill="#8C2F3D" stroke="#1B2A4A" strokeWidth="2" />
          </svg>
        </div>
        <div className="rounded-card bg-ink p-6">
          <div className="font-display text-[17px] font-semibold text-onink">Consistency</div>
          <div className="mb-[18px] font-mono text-[11px] text-onink-faint">LAST 10 WEEKS · MON–FRI</div>
          <div className="grid grid-cols-10 gap-[5px]">
            {ANALYTICS_HEAT.map((op, i) => (
              <span key={i} className="rounded-[3px]" style={{ aspectRatio: "1", background: `rgba(244,231,234,${op})` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Posts per week + reach by type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-card border border-muted-line bg-paper p-6">
          <div className="font-display text-[17px] font-semibold">Posts per week</div>
          <div className="mb-[22px] font-mono text-[11px] text-muted-fog">GOAL: 4 / WK</div>
          <div className="flex h-[150px] items-end gap-3">
            {POSTS_PER_WEEK.map((pct, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t-[6px]"
                  style={{ height: `${pct}%`, background: pct >= 80 ? "#8C2F3D" : "#E3E7EE" }}
                />
                <span className="font-mono text-[10px] text-muted-fog">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-card border border-muted-line bg-paper p-6">
          <div className="font-display text-[17px] font-semibold">Reach by post type</div>
          <div className="mb-[22px] font-mono text-[11px] text-muted-fog">AVG IMPRESSIONS</div>
          <div className="flex flex-col gap-4">
            {REACH_BY_TYPE.map((r) => (
              <div key={r.label}>
                <div className="mb-[6px] flex justify-between">
                  <span className="text-[13px] font-semibold text-[#1B2A4A]">{r.label}</span>
                  <span className="font-mono text-[11px] text-muted-fog">{r.value}</span>
                </div>
                <div className="h-[10px] overflow-hidden rounded-[6px] bg-[#EEF1F6]">
                  <div className="h-full rounded-[6px] bg-ink" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
