import Link from "next/link";
import { CAL_WEEK, type CalCell } from "@/lib/data";

const POST_STYLES: Record<string, { box: string; title: string; meta: string }> = {
  posted: { box: "bg-tint-mint", title: "text-olive-deep", meta: "text-olive" },
  draft: { box: "border border-dashed border-muted-soft bg-surface", title: "text-slate", meta: "text-muted-fog" },
  scheduled: { box: "bg-ink", title: "text-onink", meta: "text-volt" },
  needs: { box: "bg-tint-coral", title: "text-coral-text", meta: "text-coral-text" },
};

function Cell({ cell }: { cell: CalCell }) {
  return (
    <div className="min-h-[220px] bg-paper p-4">
      <div className={`font-mono text-[11px] ${cell.today ? "font-bold text-ink" : "text-muted-fog"}`}>{cell.label}</div>
      {cell.post && (
        <div className={`mt-3 rounded-[10px] p-3 ${POST_STYLES[cell.post.kind].box}`}>
          <div className={`text-[13px] font-semibold ${POST_STYLES[cell.post.kind].title}`}>{cell.post.title}</div>
          <div className={`mt-[6px] font-mono text-[10px] ${POST_STYLES[cell.post.kind].meta}`}>{cell.post.meta}</div>
        </div>
      )}
      {cell.post?.kind === "needs" && (
        <Link
          href="/composer"
          className="mt-[10px] block w-full rounded-[9px] border-[1.5px] border-dashed border-muted-soft bg-transparent px-2 py-[9px] text-center font-display text-[12px] font-semibold text-muted-fog"
        >
          + Draft with Muul
        </Link>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <div className="px-[34px] py-8">
      <div className="overflow-hidden rounded-panel border border-muted-line bg-paper">
        <div className="grid grid-cols-5 gap-px bg-muted-line">
          {CAL_WEEK.map((cell, i) => (
            <Cell key={i} cell={cell} />
          ))}
        </div>
      </div>
    </div>
  );
}
