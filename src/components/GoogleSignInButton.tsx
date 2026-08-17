"use client";

import { signIn } from "next-auth/react";

export default function GoogleSignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="mt-6 w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-on-accent transition hover:opacity-85"
    >
      Entrar com Google
    </button>
  );
}
