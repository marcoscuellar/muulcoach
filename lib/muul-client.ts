import type { ChatMessage } from "@/lib/anthropic";

export class MuulApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

/** Browser-side call into the server /api/complete route. */
export async function muulComplete(opts: {
  system: string;
  max_tokens: number;
  messages: ChatMessage[];
}): Promise<string> {
  const res = await fetch("/api/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string; code?: string };
  if (!res.ok) {
    throw new MuulApiError(data.error ?? "Something went wrong.", data.code);
  }
  return data.text ?? "";
}
