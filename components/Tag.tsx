// Rounded category pills used across Home, Calendar, and Library.
const STYLES: Record<string, string> = {
  mint: "bg-tint-mint text-olive-deep",
  coral: "bg-tint-coral text-coral-text",
  line: "bg-muted-line text-slate",
};

export default function Tag({ kind = "line", children }: { kind?: "mint" | "coral" | "line"; children: React.ReactNode }) {
  return (
    <span className={`inline-block rounded-[20px] px-[10px] py-1 text-[11px] font-semibold ${STYLES[kind]}`}>
      {children}
    </span>
  );
}
