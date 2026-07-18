import Tag from "@/components/Tag";
import { LIBRARY } from "@/lib/data";

const STATUS_COLOR: Record<string, string> = {
  POSTED: "text-verified-deep",
  SCHEDULED: "text-verified-deep",
  DRAFT: "text-muted-sage",
};

export default function LibraryPage() {
  return (
    <div className="px-[34px] py-8">
      <div className="grid grid-cols-3 gap-4">
        {LIBRARY.map((p, i) => (
          <div key={i} className="flex flex-col gap-[14px] rounded-card border border-muted-line bg-paper p-[18px]">
            <div className="flex items-center justify-between">
              <Tag kind={p.tagKind}>{p.tag}</Tag>
              <span className={`font-mono text-[10px] ${STATUS_COLOR[p.status]}`}>{p.status}</span>
            </div>
            <div className="flex-1 text-[14px] leading-[1.5] text-[#1B2A4A]">{p.body}</div>
            <div className="flex items-center justify-between border-t border-[#EEF1F6] pt-3">
              <span className="font-mono text-[11px] text-muted-fog">{p.views}</span>
              <span className="cursor-pointer font-display text-[12px] font-semibold text-olive">Remix →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
