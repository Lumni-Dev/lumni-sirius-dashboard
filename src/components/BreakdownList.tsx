import type { BreakdownItem } from "@/lib/types";
import { fmtInt } from "@/lib/format";

// Lista completa, sem teto: todos os modelos aparecem, ordenados por volume, com
// contagem, participacao no total e uma barra proporcional ao maior. Se houver
// muitos, a lista rola (nenhum e' escondido). Componente puramente visual, entao
// roda no servidor.
export default function BreakdownList({ data }: { data: BreakdownItem[] }) {
  const sorted = [...data]
    .filter((item) => item.requests > 0)
    .sort((a, b) => b.requests - a.requests);

  if (sorted.length === 0) {
    return (
      <div className="flex h-[120px] items-center justify-center text-sm text-faint">
        Sem dados no periodo.
      </div>
    );
  }

  const total = sorted.reduce((sum, item) => sum + item.requests, 0);
  const max = sorted[0].requests;

  return (
    <ul className="flex max-h-[340px] flex-col gap-3 overflow-y-auto pr-1">
      {sorted.map((item) => {
        const share = total > 0 ? (item.requests / total) * 100 : 0;
        const barPct = max > 0 ? (item.requests / max) * 100 : 0;
        return (
          <li key={item.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="truncate text-sm text-text">{item.label}</span>
              <span className="shrink-0 text-xs tabular-nums text-muted">
                {fmtInt(item.requests)} · {fmtShare(share)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-fill">
              <div
                className="h-full min-w-[3px] rounded-full bg-accent/80"
                style={{ width: `${barPct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function fmtShare(pct: number): string {
  if (pct >= 10) return `${Math.round(pct)}%`;
  if (pct >= 1) return `${pct.toFixed(1)}%`;
  return "<1%";
}
