import Anthropic from "@anthropic-ai/sdk";

// Central LLM integration point. In the design these were `window.claude.complete`
// calls; here they run server-side through the Anthropic API so no key is exposed
// to the browser. Set ANTHROPIC_API_KEY in the environment to enable.

export const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Mirrors the design's `window.claude.complete({ system, max_tokens, messages })`
 * contract and returns the assistant's plain-text reply.
 */
export async function complete(opts: {
  system: string;
  max_tokens: number;
  messages: ChatMessage[];
}): Promise<string> {
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: opts.max_tokens,
    system: opts.system,
    messages: opts.messages,
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}
