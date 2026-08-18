import Section from "@/components/Section";
import Skeleton from "@/components/Skeleton";

// Espelha o layout do DashboardView com blocos em shimmer. Os rotulos e titulos
// fixos ja aparecem (feedback melhor); so os valores e graficos ficam em shimmer.
// Usado pelos loading.tsx enquanto o servidor busca as metricas no engine.

const KPIS_PRIMARY = [
  "Requisicoes",
  "Tokens totais",
  "Latencia media",
  "Tokens por requisicao",
];

const KPIS_SECONDARY = [
  "Tokens de entrada",
  "Tokens de saida",
  "No navegador",
  "p95 de latencia",
  "Tam. medio da pergunta",
  "Tam. medio da resposta",
  "Primeira atividade",
  "Ultima atividade",
];

const ACCOUNT_LABELS = [
  "Conta criada",
  "Ultimo acesso",
  "Sessoes / dispositivos",
  "Assinatura",
  "Renova em",
  "Verificada em",
];

export default function DashboardSkeleton({
  showAccount = true,
  readOnly = false,
}: {
  showAccount?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Carregando o dashboard...</span>

      <header className="sticky top-0 z-20 border-b border-border bg-base/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-3">
          <div className="leading-none">
            <div className="font-brand text-xl font-bold uppercase tracking-[0.08em] text-text">
              Sirius
            </div>
            <div className="mt-1 font-brand text-[10px] font-semibold uppercase tracking-[0.3em] text-faint">
              Dashboard
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-8 w-56 rounded-xl" />
            {readOnly ? (
              <>
                <Skeleton className="h-8 w-28 rounded-lg" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </>
            ) : (
              <>
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-12 pt-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPIS_PRIMARY.map((label) => (
            <KpiSkeleton key={label} label={label} withHint />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPIS_SECONDARY.map((label) => (
            <KpiSkeleton key={label} label={label} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Section title="Requisicoes por dia">
            <ChartSkeleton />
          </Section>
          <Section title="Tokens por dia" subtitle="entrada + saida">
            <ChartSkeleton />
          </Section>
        </div>

        <div className="mt-6">
          <Section title="Latencia media por dia">
            <ChartSkeleton />
          </Section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Section title="Por nível">
            <ListSkeleton />
          </Section>
          <Section title="Por esforco">
            <ChartSkeleton />
          </Section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Section title="Por modo">
            <ChartSkeleton />
          </Section>
          <Section title="Por personalidade">
            <ChartSkeleton />
          </Section>
        </div>

        <div className="mt-6">
          <Section title="Padrao de uso">
            <Skeleton className="h-[180px] w-full rounded-lg" />
          </Section>
        </div>

        {showAccount ? (
          <div className="mt-6">
            <Section title="Conta">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {ACCOUNT_LABELS.map((label) => (
                  <div key={label}>
                    <div className="kpi-label">{label}</div>
                    <Skeleton className="mt-1.5 h-4 w-28" />
                  </div>
                ))}
              </div>
            </Section>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function KpiSkeleton({ label, withHint }: { label: string; withHint?: boolean }) {
  return (
    <div className="card">
      <div className="kpi-label">{label}</div>
      <Skeleton className="mt-1.5 h-7 w-24" />
      {withHint ? <Skeleton className="mt-2 h-3 w-32" /> : null}
    </div>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-[260px] w-full rounded-lg" />;
}

function ListSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i}>
          <div className="mb-1 flex items-center justify-between gap-3">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </li>
      ))}
    </ul>
  );
}
