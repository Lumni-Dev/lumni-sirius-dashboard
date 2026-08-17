import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { queryOne } from "./db";

// So entra quem ja e' usuario do Sirius: existe em sessions ou tem request_log.
async function isSiriusUser(email: string): Promise<boolean> {
  try {
    const row = await queryOne<{ ok: boolean }>(
      `SELECT (
         EXISTS(SELECT 1 FROM sessions WHERE LOWER(email) = LOWER($1))
         OR EXISTS(SELECT 1 FROM request_log WHERE LOWER(user_email) = LOWER($1))
       ) AS ok`,
      [email],
    );
    return Boolean(row?.ok);
  } catch (err) {
    console.error("[auth] falha ao validar usuario do Sirius:", err);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user }) {
      const email = user?.email?.trim().toLowerCase();
      if (!email) return false;
      return isSiriusUser(email);
    },
    async jwt({ token, profile }) {
      const googleSub = (profile as { sub?: string } | undefined)?.sub;
      if (googleSub) {
        token.googleSub = String(googleSub);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.googleSub = typeof token.googleSub === "string" ? token.googleSub : "";
      }
      return session;
    },
  },
};
