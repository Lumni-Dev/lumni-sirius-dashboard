"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-lg border border-border bg-elevated px-3 py-1.5 text-xs font-medium text-muted transition hover:text-text"
    >
      Sair
    </button>
  );
}
