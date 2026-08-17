"use client";

import { RANGES, RANGE_LABELS, type RangeKey } from "@/lib/range";
import { useRangeTransition } from "@/components/RangeTransition";

export default function RangeFilter({
  active,
  basePath = "/",
}: {
  active: RangeKey;
  basePath?: string;
}) {
  const { navigate, isPending } = useRangeTransition();

  return (
    <div
      className="inline-flex h-8 items-center rounded-xl border border-border bg-surface p-0.5"
      aria-busy={isPending}
    >
      {RANGES.map((key) => {
        const isActive = key === active;
        const href = `${basePath}?range=${key}`;
        return (
          <a
            key={key}
            href={href}
            onClick={(e) => {
              // Navegacao client dentro da transicao: mantem o dashboard atual
              // visivel com shimmer, em vez de trocar tudo pelo skeleton.
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              if (!isActive) navigate(href);
            }}
            aria-current={isActive ? "page" : undefined}
            className={
              "flex h-full items-center rounded-md px-3 text-xs font-semibold transition " +
              (isActive
                ? "bg-accent text-on-accent"
                : "text-muted hover:text-text")
            }
          >
            {RANGE_LABELS[key]}
          </a>
        );
      })}
    </div>
  );
}
