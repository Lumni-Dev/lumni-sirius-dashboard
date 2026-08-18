import { enginePost } from "./engine";
import { rangeDays, type RangeKey } from "./range";
import type {
  Account,
  BreakdownItem,
  DayPoint,
  HeatCell,
  Overview,
} from "./types";

export interface Metrics {
  exists: boolean;
  overview: Overview;
  series: DayPoint[];
  byModel: BreakdownItem[];
  byEffort: BreakdownItem[];
  byMode: BreakdownItem[];
  byPersona: BreakdownItem[];
  heatmap: HeatCell[];
  account: Account;
}

// Rotulos em portugues (mesmos do lumni-sirius-app) para os valores crus que
// vem do banco. Traducao so na exibicao; o banco continua com os valores originais.
const EFFORT_PT: Record<string, string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
  xhigh: "Muito alto",
  max: "Máximo",
};

// Nao existe mais escolha de modelo: existe um so "Sirius" e o engine decide o
// NIVEL (por velocidade) de cada pedido. O campo `model` do log acumulou varias
// formas ao longo das versoes do engine (nomes de modelo "Sirius A/B/X", as
// familias haiku/sonnet/opus, e tiers PT/EN intermediarios). Todos sao
// normalizados aqui para um unico nivel, sem nome de modelo.
const TIER_PT: Record<string, string> = {
  // Rapido — haiku (antigo "Sirius A")
  fast: "Rápido", rápido: "Rápido", rapido: "Rápido", haiku: "Rápido",
  "sirius a": "Rápido", "sirius-a": "Rápido",
  // Medio — sonnet (antigo "Sirius B")
  balanced: "Médio", equilibrado: "Médio", médio: "Médio", medio: "Médio",
  sonnet: "Médio", "sirius b": "Médio", "sirius-b": "Médio",
  // Lento — opus (antigo "Sirius X")
  capable: "Lento", capaz: "Lento", lento: "Lento", opus: "Lento",
  "sirius x": "Lento", "sirius-x": "Lento",
  // Profundo — fable (antigo "Sirius F"); praticamente nunca ocorre
  deep: "Profundo", profundo: "Profundo", fable: "Profundo",
  "sirius f": "Profundo", "sirius-f": "Profundo",
};

const MODE_PT: Record<string, string> = {
  default: "Perguntar antes de executar",
  ask: "Pedir permissão",
  plan: "Planejar antes de executar",
  acceptEdits: "Aceitar edições de arquivo",
  bypassPermissions: "Executar tudo automaticamente",
  auto: "Automático",
  dontAsk: "Não perguntar",
  manual: "Manual",
};

function translateLabels(
  items: BreakdownItem[],
  map: Record<string, string>,
): BreakdownItem[] {
  return items.map((item) => ({ ...item, label: map[item.label] ?? item.label }));
}

// Resolve um valor cru para o rotulo do mapa, tolerando a forma antiga
// "Automatico (X)" (usa o miolo). Desconhecido volta cru.
function labelWith(raw: string, map: Record<string, string>): string {
  const key = String(raw).trim().toLowerCase();
  if (map[key]) return map[key];
  const inner = key.match(/\(([^)]+)\)/)?.[1]?.trim();
  if (inner && map[inner]) return map[inner];
  return String(raw);
}

const tierLabel = (raw: string) => labelWith(raw, TIER_PT);
const effortLabel = (raw: string) => labelWith(raw, EFFORT_PT);

// Normaliza o rotulo e junta linhas equivalentes num so item (ex.: "Sirius A",
// "fast" e "Rápido" viram um unico "Rápido"), somando contagem e tokens e
// reordenando por volume. Evita niveis duplicados vindos de versoes diferentes.
function foldBy(
  items: BreakdownItem[],
  label: (raw: string) => string,
): BreakdownItem[] {
  const merged = new Map<string, BreakdownItem>();
  for (const item of items) {
    const key = label(item.label);
    const cur = merged.get(key);
    if (cur) {
      cur.requests += item.requests;
      cur.totalTokens += item.totalTokens;
    } else {
      merged.set(key, {
        label: key,
        requests: item.requests,
        totalTokens: item.totalTokens,
      });
    }
  }
  return [...merged.values()].sort((a, b) => b.requests - a.requests);
}

// Busca tudo do engine numa unica chamada e preenche os dias vazios da serie.
export async function getMetrics(
  email: string,
  sub: string,
  range: RangeKey,
): Promise<Metrics> {
  const data = await enginePost<Metrics>("/engine_metrics", { email, sub, range });
  return {
    exists: Boolean(data.exists),
    overview: data.overview,
    series: fillGaps(data.series || [], rangeDays(range)),
    byModel: foldBy(data.byModel || [], tierLabel),
    byEffort: foldBy(data.byEffort || [], effortLabel),
    byMode: translateLabels(data.byMode || [], MODE_PT),
    byPersona: data.byPersona || [],
    heatmap: data.heatmap || [],
    account: data.account,
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
