export type RangeKey = "7d" | "30d" | "90d" | "all";

export const RANGES: RangeKey[] = ["7d", "30d", "90d", "all"];

export const RANGE_LABELS: Record<RangeKey, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
  all: "Tudo",
};

export function normalizeRange(value: string | undefined | null): RangeKey {
  return RANGES.includes((value ?? "") as RangeKey) ? (value as RangeKey) : "30d";
}

// Numero de dias da janela, ou null para "tudo" (sem filtro de data).
export function rangeDays(range: RangeKey): number | null {
  switch (range) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    default:
      return null;
  }
}
