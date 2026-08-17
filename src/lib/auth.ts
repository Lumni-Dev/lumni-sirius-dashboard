import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { enginePost } from "./engine";

// So entra quem ja e' usuario do Sirius: o engine confere em sessions/request_log.
async function isSiriusUser(email: string): Promise<boolean> {
  try {
    const data = await enginePost<{ exists: boolean }>("/engine_user_exists", {
      email,
    });
    return Boolean(data?.exists);
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
