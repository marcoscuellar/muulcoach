import { Suspense } from "react";
import Composer from "@/components/Composer";

export default function ComposerPage() {
  return (
    <Suspense fallback={<div className="p-8 font-mono text-[12px] text-muted-fog">Loading composer…</div>}>
      <Composer />
    </Suspense>
  );
}
