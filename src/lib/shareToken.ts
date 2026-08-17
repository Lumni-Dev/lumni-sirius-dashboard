import { createHmac, timingSafeEqual } from "crypto";

// Link de compartilhamento sem estado: o token carrega o dono (email + sub) e a
// expiracao, tudo assinado por HMAC-SHA256. Nada e' gravado no servidor; a
// validade e' garantida pela assinatura e pelo campo `exp`. Sem revogacao antes
// da expiracao, por decisao de projeto.

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hora
const SEPARATOR = "~"; // fora do alfabeto base64url e seguro em URL

export interface SharePayload {
  email: string;
  sub: string;
}

interface SignedPayload extends SharePayload {
  exp: number; // epoch em milissegundos
}

// Reusa NEXTAUTH_SECRET quando SHARE_LINK_SECRET nao esta definido, para nao
// exigir configuracao extra. Sem segredo nao ha como assinar com seguranca.
function getSecret(): string {
  const secret = process.env.SHARE_LINK_SECRET || process.env.NEXTAUTH_SECRET || "";
  if (!secret) {
    throw new Error(
      "SHARE_LINK_SECRET ou NEXTAUTH_SECRET precisa estar configurado para gerar links de compartilhamento.",
    );
  }
  return secret;
}

function b64urlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function b64urlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

// Gera um token assinado valido por `ttlMs` (padrao 1 hora).
export function createShareToken(
  payload: SharePayload,
  now: number,
  ttlMs: number = DEFAULT_TTL_MS,
): string {
  const email = payload.email.trim().toLowerCase();
  if (!email) {
    throw new Error("Email obrigatorio para gerar o link de compartilhamento.");
  }
  const body: SignedPayload = { email, sub: payload.sub ?? "", exp: now + ttlMs };
  const encoded = b64urlEncode(JSON.stringify(body));
  const signature = sign(encoded, getSecret());
  return `${encoded}${SEPARATOR}${signature}`;
}

// Valida o token: assinatura correta e nao expirado. Retorna o dono ou null.
export function verifyShareToken(token: string, now: number): SharePayload | null {
  if (typeof token !== "string" || !token) return null;

  const sepIndex = token.indexOf(SEPARATOR);
  if (sepIndex <= 0 || sepIndex >= token.length - 1) return null;

  const encoded = token.slice(0, sepIndex);
  const signature = token.slice(sepIndex + 1);

  let expected: string;
  try {
    expected = sign(encoded, getSecret());
  } catch {
    return null;
  }

  const sigBuf = Buffer.from(signature, "base64url");
  const expBuf = Buffer.from(expected, "base64url");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  let parsed: SignedPayload;
  try {
    parsed = JSON.parse(b64urlDecode(encoded)) as SignedPayload;
  } catch {
    return null;
  }

  if (
    typeof parsed?.email !== "string" ||
    typeof parsed?.exp !== "number" ||
    !Number.isFinite(parsed.exp)
  ) {
    return null;
  }
  if (now >= parsed.exp) return null;

  return { email: parsed.email, sub: typeof parsed.sub === "string" ? parsed.sub : "" };
}
