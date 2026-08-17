import Link from "next/link";
import { RANGES, RANGE_LABELS, type RangeKey } from "@/lib/range";

export default function RangeFilter({ active }: { active: RangeKey }) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-surface p-1">
      {RANGES.map((key) => {
        const isActive = key === active;
        return (
          <Link
            key={key}
            href={`/?range=${key}`}
            scroll={false}
            className={
              "rounded-lg px-3 py-1.5 text-xs font-medium transition " +
              (isActive
                ? "bg-accent text-white"
                : "text-muted hover:text-text")
            }
          >
            {RANGE_LABELS[key]}
          </Link>
        );
      })}
    </div>
  );
}
