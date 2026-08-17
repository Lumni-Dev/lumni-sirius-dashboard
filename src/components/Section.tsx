export default function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="section-title">{title}</h2>
        {subtitle ? <span className="text-xs text-faint">{subtitle}</span> : null}
      </div>
      {children}
    </section>
  );
}
