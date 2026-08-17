import type { Metadata } from "next";
import { getMetrics } from "@/lib/metrics";
import { normalizeRange } from "@/lib/range";
import { verifyShareToken } from "@/lib/shareToken";
import DashboardView from "@/components/DashboardView";

export const dynamic = "force-dynamic";

const TZ = process.env.DASHBOARD_TZ || "America/Sao_Paulo";

// Link publico: nao deve ser indexado por buscadores.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Hora de expiracao no fuso do painel (o servidor roda em UTC, entao o fuso e'
// sempre explicito).
function fmtExpiry(epochMs: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(new Date(epochMs));
}

export default async function SharedDashboardPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { range?: string };
}) {
  const payload = verifyShareToken(params.token, Date.now());
  if (!payload) {
    return (
      <CenteredCard title="Link indisponivel">
        Este link de compartilhamento expirou ou nao e valido. Peca um novo link a
        quem compartilhou o dashboard.
      </CenteredCard>
    );
  }

  const range = normalizeRange(searchParams?.range);

  let metrics;
  try {
    metrics = await getMetrics(payload.email, payload.sub, range);
  } catch (err) {
    console.error("[shared] engine indisponivel:", err);
    return (
      <CenteredCard title="Dados indisponiveis">
        Nao foi possivel carregar os dados agora. O engine esta indisponivel — tente
        novamente em instantes.
      </CenteredCard>
    );
  }

  return (
    <DashboardView
      metrics={metrics}
      range={range}
      basePath={`/shared/${params.token}`}
      showAccount={false}
      headerActions={
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 items-center rounded-lg border border-border bg-elevated px-3 text-xs font-medium text-muted">
            Somente leitura
          </span>
          <span className="inline-flex h-8 items-center rounded-lg border border-border bg-elevated px-3 text-xs font-medium text-muted">
            Expira as {fmtExpiry(payload.exp)}
          </span>
        </div>
      }
    />
  );
}

function CenteredCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5">
      <div className="card w-full text-center">
        <h1 className="font-brand text-base font-semibold uppercase tracking-[0.18em] text-text">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted">{children}</p>
      </div>
    </main>
  );
}
