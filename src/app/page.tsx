import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  getAccount,
  getBreakdown,
  getHeatmap,
  getOverview,
  getSeries,
} from "@/lib/metrics";
import type { Account } from "@/lib/types";
import { normalizeRange } from "@/lib/range";
import {
  fmtDateTimeFromEpoch,
  fmtDateTimeFromIso,
  fmtDuration,
  fmtInt,
  fmtTokens,
} from "@/lib/format";
import KpiCard from "@/components/KpiCard";
import RangeFilter from "@/components/RangeFilter";
import SignOutButton from "@/components/SignOutButton";
import Section from "@/components/Section";
import Heatmap from "@/components/Heatmap";
import {
  BreakdownBars,
  BreakdownDonut,
  LatencyLine,
  RequestsArea,
  TokensBars,
} from "@/components/charts";

export const dynamic = "force-dynamic";

const TZ = process.env.DASHBOARD_TZ || "America/Sao_Paulo";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) redirect("/login");

  const sub = session?.googleSub ?? "";
  const range = normalizeRange(searchParams?.range);

  const [overview, series, byModel, byEffort, byMode, byPersona, heat, account] =
    await Promise.all([
      getOverview(email, range),
      getSeries(email, range),
      getBreakdown(email, range, "model"),
      getBreakdown(email, range, "effort"),
      getBreakdown(email, range, "mode"),
      getBreakdown(email, range, "personality"),
      getHeatmap(email, range),
      getAccount(email, sub),
    ]);

  const browserPct =
    overview.requests > 0
      ? Math.round((overview.browserRequests / overview.requests) * 100)
      : 0;

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent font-brand text-sm font-black text-on-accent">
            S
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight">Sirius Dashboard</h1>
            <p className="text-xs text-faint">Suas metricas de uso</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RangeFilter active={range} />
          <div className="flex items-center gap-2">
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt=""
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full border border-border"
              />
            ) : null}
            <span className="hidden text-xs text-muted sm:block">{email}</span>
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          accent
          label="Requisicoes"
          value={fmtInt(overview.requests)}
          hint={`${fmtInt(overview.activeDays)} dias ativos`}
        />
        <KpiCard
          accent
          label="Tokens totais"
          value={fmtTokens(overview.totalTokens)}
          hint={`${fmtTokens(overview.inputTokens)} entrada / ${fmtTokens(overview.outputTokens)} saida`}
        />
        <KpiCard
          accent
          label="Latencia media"
          value={fmtDuration(overview.avgLatency)}
          hint={`p50 ${fmtDuration(overview.p50Latency)} · p95 ${fmtDuration(overview.p95Latency)}`}
        />
        <KpiCard
          accent
          label="Tokens por requisicao"
          value={fmtInt(overview.avgTokens)}
          hint="media geral"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Tokens de entrada" value={fmtTokens(overview.inputTokens)} />
        <KpiCard label="Tokens de saida" value={fmtTokens(overview.outputTokens)} />
        <KpiCard
          label="No navegador"
          value={fmtInt(overview.browserRequests)}
          hint={`${browserPct}% do total`}
        />
        <KpiCard label="p95 de latencia" value={fmtDuration(overview.p95Latency)} />
        <KpiCard
          label="Tam. medio da pergunta"
          value={`${fmtInt(overview.avgQuestionLen)} car.`}
        />
        <KpiCard
          label="Tam. medio da resposta"
          value={`${fmtInt(overview.avgAnswerLen)} car.`}
        />
        <KpiCard
          label="Primeira atividade"
          value={fmtDateTimeFromIso(overview.firstAt)}
        />
        <KpiCard label="Ultima atividade" value={fmtDateTimeFromIso(overview.lastAt)} />
      </div>

      {overview.requests === 0 ? (
        <div className="card mt-8 text-center text-sm text-muted">
          Nenhuma atividade registrada no periodo selecionado.
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Section title="Requisicoes por dia">
          <RequestsArea data={series} />
        </Section>
        <Section title="Tokens por dia" subtitle="entrada + saida">
          <TokensBars data={series} />
        </Section>
      </div>

      <div className="mt-6">
        <Section
          title="Latencia media por dia"
          subtitle={`p50 ${fmtDuration(overview.p50Latency)} · p95 ${fmtDuration(overview.p95Latency)}`}
        >
          <LatencyLine data={series} />
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Por modelo">
          <BreakdownDonut data={byModel} />
        </Section>
        <Section title="Por esforco">
          <BreakdownBars data={byEffort} />
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Por modo">
          <BreakdownBars data={byMode} />
        </Section>
        <Section title="Por personalidade">
          <BreakdownBars data={byPersona} />
        </Section>
      </div>

      <div className="mt-6">
        <Section title="Padrao de uso" subtitle={`hora x dia · fuso ${TZ}`}>
          <Heatmap cells={heat} />
        </Section>
      </div>

      <div className="mt-6">
        <Section title="Conta">
          <AccountBlock account={account} />
        </Section>
      </div>

      <footer className="mt-10 text-center text-xs text-faint">
        Sirius Dashboard · dados somente leitura do engine
      </footer>
    </main>
  );
}

function AccountBlock({ account }: { account: Account }) {
  const items: { label: string; value: string }[] = [
    { label: "Conta criada", value: fmtDateTimeFromEpoch(account.createdAt) },
    { label: "Ultimo acesso", value: fmtDateTimeFromEpoch(account.lastSeen) },
    { label: "Sessoes / dispositivos", value: fmtInt(account.devices) },
    { label: "Assinatura", value: account.subStatus || "sem assinatura" },
    {
      label: "Renova em",
      value: fmtDateTimeFromEpoch(account.currentPeriodEnd),
    },
    { label: "Verificada em", value: fmtDateTimeFromEpoch(account.verifiedAt) },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="kpi-label">{item.label}</div>
          <div className="mt-1 text-sm font-medium text-text">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
