import { Pool } from "pg";

declare global {
  var _siriusPool: Pool | undefined;
}

function makePool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL nao configurada.");
  }
  const ssl =
    (process.env.DATABASE_SSL || "").toLowerCase() === "require"
      ? { rejectUnauthorized: false }
      : undefined;
  return new Pool({
    connectionString,
    ssl,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    statement_timeout: 15_000,
    query_timeout: 15_000,
    application_name: "lumni-sirius-dashboard",
    // Defesa em profundidade: toda a sessao abre como somente-leitura.
    options: "-c default_transaction_read_only=on",
  });
}

// Criacao preguicosa: importar este modulo (ex.: durante o build) nunca conecta
// nem exige DATABASE_URL. O pool so nasce na primeira query, em tempo de request.
function getPool(): Pool {
  if (!global._siriusPool) {
    global._siriusPool = makePool();
  }
  return global._siriusPool;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length ? rows[0] : null;
}
