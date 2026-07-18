"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="font-mono text-[10px] tracking-[0.06em] text-onink-faint hover:text-white"
    >
      SIGN OUT
    </button>
  );
}
