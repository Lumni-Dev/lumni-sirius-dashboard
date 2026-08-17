const ENGINE_URL = (process.env.ENGINE_URL || "").replace(/\/+$/, "");
const ENGINE_TOKEN = process.env.ENGINE_TOKEN || "";

// Chama o engine (mesma VPS, ja publico e com acesso ao Postgres) por HTTPS.
// Roda apenas no servidor; o token nunca chega ao cliente.
export async function enginePost<T>(path: string, body: unknown): Promise<T> {
  if (!ENGINE_URL) {
    throw new Error("ENGINE_URL nao configurada.");
  }
  const res = await fetch(`${ENGINE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(ENGINE_TOKEN ? { "X-Sirius-Token": ENGINE_TOKEN } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`engine ${path} respondeu ${res.status}`);
  }
  return (await res.json()) as T;
}
