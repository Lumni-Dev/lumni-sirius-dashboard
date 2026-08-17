import type { HeatCell } from "@/lib/types";
import { fmtInt } from "@/lib/format";

const DOW_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const HOURS = Array.from({ length: 24 }, (_, h) => h);

export default function Heatmap({ cells }: { cells: HeatCell[] }) {
  const matrix: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  let max = 0;
  for (const cell of cells) {
    if (cell.dow >= 0 && cell.dow < 7 && cell.hour >= 0 && cell.hour < 24) {
      matrix[cell.dow][cell.hour] = cell.requests;
      if (cell.requests > max) max = cell.requests;
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="grid grid-cols-[2.4rem_repeat(24,1fr)] gap-1">
          {matrix.map((row, dow) => (
            <div key={dow} className="contents">
              <div className="flex items-center text-[11px] text-faint">
                {DOW_LABELS[dow]}
              </div>
              {row.map((value, hour) => (
                <div
                  key={hour}
                  title={`${DOW_LABELS[dow]} ${String(hour).padStart(2, "0")}h — ${fmtInt(value)} req`}
                  className="aspect-square rounded-[3px] border border-border/60"
                  style={{ backgroundColor: cellColor(value, max) }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-[2.4rem_repeat(24,1fr)] gap-1">
          <div />
          {HOURS.map((hour) => (
            <div key={hour} className="text-center text-[9px] text-faint">
              {hour % 6 === 0 ? `${hour}h` : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function cellColor(value: number, max: number): string {
  if (max <= 0 || value <= 0) return "rgba(124, 108, 255, 0.05)";
  const alpha = 0.15 + 0.8 * (value / max);
  return `rgba(124, 108, 255, ${alpha.toFixed(3)})`;
}
