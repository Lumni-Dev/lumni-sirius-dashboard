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
    byModel: data.byModel || [],
    byEffort: translateLabels(data.byEffort || [], EFFORT_PT),
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
