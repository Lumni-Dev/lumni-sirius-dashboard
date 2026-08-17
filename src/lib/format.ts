const INT = new Intl.NumberFormat("pt-BR");

export function fmtInt(value: number): string {
  return INT.format(Math.round(value || 0));
}

export function fmtTokens(value: number): string {
  const v = value || 0;
  if (v >= 1_000_000) return trim((v / 1_000_000).toFixed(2)) + "M";
  if (v >= 1_000) return trim((v / 1_000).toFixed(1)) + "k";
  return fmtInt(v);
}

export function fmtDecimal(value: number, digits = 2): string {
  return (value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export function fmtDuration(seconds: number): string {
  const s = seconds || 0;
  if (s <= 0) return "—";
  if (s < 1) return `${Math.round(s * 1000)} ms`;
  if (s < 60) return `${trim(s.toFixed(2))} s`;
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return `${m}m ${r}s`;
}

export function fmtDateTimeFromEpoch(epochSeconds: number | null): string {
  if (!epochSeconds || epochSeconds <= 0) return "—";
  const d = new Date(epochSeconds * 1000);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function fmtDateTimeFromIso(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function fmtDayLabel(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
}

function trim(text: string): string {
  return text.replace(/\.?0+$/, "");
}
