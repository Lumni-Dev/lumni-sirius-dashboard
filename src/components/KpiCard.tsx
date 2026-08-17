export default function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="card">
      <div className="kpi-label">{label}</div>
      <div className={"kpi-value" + (accent ? " text-accent-soft" : "")}>{value}</div>
      {hint ? <div className="kpi-hint">{hint}</div> : null}
    </div>
  );
}
