"use client";

import { useEffect } from "react";
import { WINGMAN_STORAGE_KEY } from "@/lib/wingman";
import { pullUserData, pushUserData, SYNCED_EVENT } from "@/lib/sync";

// On load (when signed in), reconcile the local goal store with the account
// copy by timestamp — newest wins — then let goal surfaces re-read via the
// SYNCED_EVENT. Component saves push back to the account on their own.
type Store = { goals?: unknown[]; alarms?: unknown[]; updatedAt?: number };

export default function SyncProvider({ authed }: { authed: boolean }) {
  useEffect(() => {
    if (!authed) return;

    let local: Store = {};
    try {
      local = JSON.parse(localStorage.getItem(WINGMAN_STORAGE_KEY) || "{}");
    } catch {
      /* ignore */
    }

    pullUserData<Store>("wingman").then((remote) => {
      const localAt = local?.updatedAt ?? 0;
      const remoteAt = remote?.updatedAt ?? 0;
      if (remote && remoteAt >= localAt) {
        // Account copy is newer — adopt it locally and refresh the UI.
        localStorage.setItem(WINGMAN_STORAGE_KEY, JSON.stringify(remote));
        window.dispatchEvent(new Event(SYNCED_EVENT));
      } else if (localAt > remoteAt) {
        // Local is newer (e.g. made offline) — bring the account up to date.
        pushUserData("wingman", local);
      }
    });
  }, [authed]);

  return null;
}
