import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import { createShareToken } from "@/lib/shareToken";

export const dynamic = "force-dynamic";

// Gera um link publico de 1 hora para o dashboard do usuario logado.
// Protegido: exige sessao valida. O token carrega o dono, assinado (ver shareToken).
export async function POST() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  let token: string;
  try {
    token = createShareToken(
      { email, sub: session?.googleSub ?? "" },
      Date.now(),
    );
  } catch (err) {
    console.error("[share] falha ao gerar token:", err);
    return NextResponse.json(
      { error: "Nao foi possivel gerar o link agora." },
      { status: 500 },
    );
  }

  const url = `${resolveBaseUrl()}/shared/${token}`;
  return NextResponse.json({ url, expiresInSeconds: 3600 });
}

// Prefere NEXTAUTH_URL (URL publica canonica). Se ausente, deriva da requisicao.
function resolveBaseUrl(): string {
  const configured = (process.env.NEXTAUTH_URL || "").replace(/\/+$/, "");
  if (configured) return configured;

  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "";
}
