import type { ReactNode } from "react";
import type { Metrics } from "@/lib/metrics";
import type { RangeKey } from "@/lib/range";
import type { Account } from "@/lib/types";
import {
  fmtDateTimeFromEpoch,
  fmtDateTimeFromIso,
  fmtDuration,
  fmtInt,
  fmtTokens,
} from "@/lib/format";
import KpiCard from "@/components/KpiCard";
import RangeFilter from "@/components/RangeFilter";
import Section from "@/components/Section";
import Heatmap from "@/components/Heatmap";
import {
  BreakdownBars,
  BreakdownDonut,
  LatencyLine,
  RequestsArea,
  TokensBars,
} from "@/components/charts";

const TZ = process.env.DASHBOARD_TZ || "America/Sao_Paulo";

// Renderizacao unica do dashboard, usada tanto pelo dono (com acoes no header e
// bloco "Conta") quanto pela visao publica compartilhada (somente leitura).
export default function DashboardView({
  metrics,
  range,
  basePath = "/",
  showAccount = true,
  headerActions = null,
}: {
  metrics: Metrics;
  range: RangeKey;
  basePath?: string;
  showAccount?: boolean;
  headerActions?: ReactNode;
}) {
  const {
    overview,
    series,
    byModel,
    byEffort,
    byMode,
    byPersona,
    heatmap: heat,
    account,
  } = metrics;

  const browserPct =
    overview.requests > 0
      ? Math.round((overview.browserRequests / overview.requests) * 100)
      : 0;

  return (
    <>
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
            <RangeFilter active={range} basePath={basePath} />
            {headerActions}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-12 pt-6">
        {overview.requests === 0 ? (
          <div className="card mt-2 flex flex-col items-center gap-3 py-16 text-center">
            <h2 className="font-brand text-base font-semibold uppercase tracking-[0.18em] text-text">
              Nenhuma atividade ainda
            </h2>
            <p className="max-w-md text-sm text-muted">
              {range === "all"
                ? "Assim que voce usar o Sirius, as suas metricas de uso aparecem aqui."
                : 'Nada de atividade neste periodo. Tente o filtro "Tudo" ali em cima para ver todo o historico.'}
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}

        {showAccount ? (
          <div className="mt-6">
            <Section title="Conta">
              <AccountBlock account={account} />
            </Section>
          </div>
        ) : null}
      </main>
    </>
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
