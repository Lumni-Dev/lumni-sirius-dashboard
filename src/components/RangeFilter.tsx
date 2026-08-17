import Link from "next/link";
import { RANGES, RANGE_LABELS, type RangeKey } from "@/lib/range";

export default function RangeFilter({
  active,
  basePath = "/",
}: {
  active: RangeKey;
  basePath?: string;
}) {
  return (
    <div className="inline-flex h-8 items-center rounded-xl border border-border bg-surface p-0.5">
      {RANGES.map((key) => {
        const isActive = key === active;
        return (
          <Link
            key={key}
            href={`${basePath}?range=${key}`}
            scroll={false}
            className={
              "flex h-full items-center rounded-md px-3 text-xs font-semibold transition " +
              (isActive
                ? "bg-accent text-on-accent"
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
