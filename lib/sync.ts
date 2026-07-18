// Client helpers to sync a localStorage bucket with the per-user account store
// (/api/userdata → ollin-kv). Fire-and-forget on write; best-effort on read.
// Everything degrades gracefully: if the user isn't signed in or the network
// fails, the app keeps working off localStorage.

export type SyncKey = "wingman" | "profile" | "chat";

/** Read the account copy of a bucket. Returns null when signed out / offline. */
export async function pullUserData<T = unknown>(key: SyncKey): Promise<T | null> {
  try {
    const res = await fetch(`/api/userdata?key=${key}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.value ?? null) as T | null;
  } catch {
    return null;
  }
}

/** Write a bucket to the account. Fire-and-forget; failures are ignored. */
export function pushUserData(key: SyncKey, value: unknown): void {
  try {
    fetch("/api/userdata", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

/** Event fired after account data is pulled into localStorage on load. */
export const SYNCED_EVENT = "coachbob:synced";

/** localStorage key for the chat transcript (shared by Coach + SyncProvider). */
export const CHAT_STORAGE_KEY = "muul-coach-chat-v1";
