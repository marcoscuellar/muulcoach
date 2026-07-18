"use client";

import { useEffect } from "react";
import { WINGMAN_STORAGE_KEY } from "@/lib/wingman";
import { PROFILE_KEY } from "@/lib/profile";
import { pullUserData, pushUserData, SYNCED_EVENT, CHAT_STORAGE_KEY, type SyncKey } from "@/lib/sync";

// On load (when signed in), reconcile each local bucket with its account copy
// by timestamp — newest wins — then let the app re-read via SYNCED_EVENT.
// Component saves push back to the account on their own.
type Stamped = { updatedAt?: number } & Record<string, unknown>;

const BUCKETS: { key: SyncKey; storageKey: string }[] = [
  { key: "wingman", storageKey: WINGMAN_STORAGE_KEY },
  { key: "profile", storageKey: PROFILE_KEY },
  { key: "chat", storageKey: CHAT_STORAGE_KEY },
];

async function reconcile(key: SyncKey, storageKey: string): Promise<boolean> {
  let local: Stamped = {};
  try {
    local = JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch {
    /* ignore */
  }
  const remote = await pullUserData<Stamped>(key);
  const localAt = local?.updatedAt ?? 0;
  const remoteAt = remote?.updatedAt ?? 0;

  if (remote && remoteAt > localAt) {
    // Account copy is newer — adopt it locally.
    localStorage.setItem(storageKey, JSON.stringify(remote));
    return true;
  }

  const localHasData = local && Object.keys(local).length > 0;
  if (localHasData && localAt >= remoteAt) {
    // Local is newer or the account has nothing yet — bring the account up to
    // date. Stamp legacy data missing a timestamp so future compares work.
    const stamped = local.updatedAt ? local : { ...local, updatedAt: Date.now() };
    if (!local.updatedAt) localStorage.setItem(storageKey, JSON.stringify(stamped));
    pushUserData(key, stamped);
  }
  return false;
}

export default function SyncProvider({ authed }: { authed: boolean }) {
  useEffect(() => {
    if (!authed) return;
    Promise.all(BUCKETS.map((b) => reconcile(b.key, b.storageKey))).then((results) => {
      if (results.some(Boolean)) window.dispatchEvent(new Event(SYNCED_EVENT));
    });
  }, [authed]);

  return null;
}
