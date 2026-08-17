import { query, queryOne } from "./db";
import { rangeDays, type RangeKey } from "./range";
import type {
  Account,
  BreakdownItem,
  DayPoint,
  HeatCell,
  Overview,
} from "./types";

const TZ = process.env.DASHBOARD_TZ || "America/Sao_Paulo";

const BREAKDOWN_COLUMNS = {
  model: { col: "model", empty: "(desconhecido)" },
  effort: { col: "effort", empty: "(desconhecido)" },
  mode: { col: "mode", empty: "(desconhecido)" },
  personality: { col: "personality_name", empty: "Sem personalidade" },
} as const;

export type BreakdownKey = keyof typeof BREAKDOWN_COLUMNS;

// Filtro de janela reutilizado: $1 = e-mail, $2 = dias (null = tudo).
const WINDOW =
  "LOWER(user_email) = LOWER($1)" +
  " AND ($2::int IS NULL OR asked_day >= CURRENT_DATE - ($2::int - 1))";

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toIso(value: unknown): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function getOverview(email: string, range: RangeKey): Promise<Overview> {
  const days = rangeDays(range);
  const row = await queryOne<Record<string, unknown>>(
    `SELECT
       COUNT(*)::int AS requests,
       COALESCE(SUM(input_tokens), 0)::bigint AS input_tokens,
       COALESCE(SUM(output_tokens), 0)::bigint AS output_tokens,
       COALESCE(SUM(total_tokens), 0)::bigint AS total_tokens,
       COALESCE(AVG(response_time), 0)::float8 AS avg_latency,
       COALESCE(percentile_cont(0.5) WITHIN GROUP (ORDER BY response_time), 0)::float8 AS p50_latency,
       COALESCE(percentile_cont(0.95) WITHIN GROUP (ORDER BY response_time), 0)::float8 AS p95_latency,
       COUNT(DISTINCT asked_day)::int AS active_days,
       MIN(asked_at) AS first_at,
       MAX(asked_at) AS last_at,
       COALESCE(AVG(total_tokens), 0)::float8 AS avg_tokens,
       COALESCE(AVG(LENGTH(question)), 0)::float8 AS avg_question_len,
       COALESCE(AVG(LENGTH(answer)), 0)::float8 AS avg_answer_len,
       COALESCE(SUM(CASE WHEN browser THEN 1 ELSE 0 END), 0)::int AS browser_requests
     FROM request_log
     WHERE ${WINDOW}`,
    [email, days],
  );
  return {
    requests: num(row?.requests),
    inputTokens: num(row?.input_tokens),
    outputTokens: num(row?.output_tokens),
    totalTokens: num(row?.total_tokens),
    avgLatency: num(row?.avg_latency),
    p50Latency: num(row?.p50_latency),
    p95Latency: num(row?.p95_latency),
    activeDays: num(row?.active_days),
    firstAt: toIso(row?.first_at),
    lastAt: toIso(row?.last_at),
    avgTokens: num(row?.avg_tokens),
    avgQuestionLen: num(row?.avg_question_len),
    avgAnswerLen: num(row?.avg_answer_len),
    browserRequests: num(row?.browser_requests),
  };
}

export async function getSeries(email: string, range: RangeKey): Promise<DayPoint[]> {
  const days = rangeDays(range);
  const rows = await query<Record<string, unknown>>(
    `SELECT asked_day::text AS day,
            COUNT(*)::int AS requests,
            COALESCE(SUM(input_tokens), 0)::bigint AS input_tokens,
            COALESCE(SUM(output_tokens), 0)::bigint AS output_tokens,
            COALESCE(SUM(total_tokens), 0)::bigint AS total_tokens,
            COALESCE(AVG(response_time), 0)::float8 AS avg_latency
     FROM request_log
     WHERE ${WINDOW}
     GROUP BY asked_day
     ORDER BY asked_day`,
    [email, days],
  );
  const points: DayPoint[] = rows.map((r) => ({
    day: String(r.day),
    requests: num(r.requests),
    inputTokens: num(r.input_tokens),
    outputTokens: num(r.output_tokens),
    totalTokens: num(r.total_tokens),
    avgLatency: num(r.avg_latency),
  }));
  return fillGaps(points, days);
}

export async function getBreakdown(
  email: string,
  range: RangeKey,
  key: BreakdownKey,
): Promise<BreakdownItem[]> {
  const days = rangeDays(range);
  const def = BREAKDOWN_COLUMNS[key];
  // def.col vem de uma whitelist fixa (nunca de entrada do usuario): seguro interpolar.
  const rows = await query<Record<string, unknown>>(
    `SELECT COALESCE(NULLIF(${def.col}, ''), $3) AS label,
            COUNT(*)::int AS requests,
            COALESCE(SUM(total_tokens), 0)::bigint AS total_tokens
     FROM request_log
     WHERE ${WINDOW}
     GROUP BY 1
     ORDER BY requests DESC, label ASC`,
    [email, days, def.empty],
  );
  return rows.map((r) => ({
    label: String(r.label),
    requests: num(r.requests),
    totalTokens: num(r.total_tokens),
  }));
}

export async function getHeatmap(email: string, range: RangeKey): Promise<HeatCell[]> {
  const days = rangeDays(range);
  const rows = await query<Record<string, unknown>>(
    `SELECT EXTRACT(DOW FROM asked_at AT TIME ZONE $3)::int AS dow,
            EXTRACT(HOUR FROM asked_at AT TIME ZONE $3)::int AS hour,
            COUNT(*)::int AS requests
     FROM request_log
     WHERE ${WINDOW}
     GROUP BY 1, 2`,
    [email, days, TZ],
  );
  return rows.map((r) => ({
    dow: num(r.dow),
    hour: num(r.hour),
    requests: num(r.requests),
  }));
}

export async function getAccount(email: string, sub: string): Promise<Account> {
  const sess = await queryOne<Record<string, unknown>>(
    `SELECT MIN(created_at)::float8 AS created_at,
            MAX(last_seen)::float8 AS last_seen,
            COUNT(*)::int AS devices
     FROM sessions
     WHERE LOWER(email) = LOWER($1) OR ($2 <> '' AND sub = $2)`,
    [email, sub],
  );
  const subrow = await queryOne<Record<string, unknown>>(
    `SELECT status, current_period_end, verified_at
     FROM subscriptions
     WHERE LOWER(email) = LOWER($1) OR ($2 <> '' AND sub = $2)
     ORDER BY verified_at DESC
     LIMIT 1`,
    [email, sub],
  );
  const createdAt = num(sess?.created_at);
  const lastSeen = num(sess?.last_seen);
  const periodEnd = num(subrow?.current_period_end);
  const verifiedAt = num(subrow?.verified_at);
  return {
    createdAt: createdAt > 0 ? createdAt : null,
    lastSeen: lastSeen > 0 ? lastSeen : null,
    devices: num(sess?.devices),
    subStatus: subrow?.status ? String(subrow.status) : null,
    currentPeriodEnd: periodEnd > 0 ? periodEnd : null,
    verifiedAt: verifiedAt > 0 ? verifiedAt : null,
  };
}

function fillGaps(points: DayPoint[], days: number | null): DayPoint[] {
  const map = new Map(points.map((p) => [p.day, p]));
  let start: string;
  let end: string;
  if (days) {
    end = ymd(new Date());
    start = addDays(end, -(days - 1));
  } else {
    if (points.length === 0) return [];
    start = points[0].day;
    end = points[points.length - 1].day;
  }
  const out: DayPoint[] = [];
  for (let day = start; day <= end; day = addDays(day, 1)) {
    out.push(
      map.get(day) ?? {
        day,
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        avgLatency: 0,
      },
    );
  }
  return out;
}

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(isoDay: string, delta: number): string {
  const d = new Date(`${isoDay}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return ymd(d);
}
