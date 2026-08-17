"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BreakdownItem, DayPoint } from "@/lib/types";
import { fmtDayLabel, fmtInt } from "@/lib/format";

const AXIS = { stroke: "#5c5d68", fontSize: 11 };
const GRID = "rgba(255, 255, 255, 0.07)";
const TOOLTIP_STYLE = {
  background: "#141416",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  borderRadius: "10px",
  color: "#f0f1f5",
  fontSize: "12px",
};
// Texto do tooltip sempre claro: o marcador ao lado ja indica a cor da serie,
// e algumas cores da PALETTE sao escuras demais para servir de texto.
const TOOLTIP_ITEM_STYLE = { color: "#f0f1f5" };
const TOOLTIP_LABEL_STYLE = { color: "#f0f1f5", marginBottom: "2px" };
const LEGEND_STYLE = { fontSize: 12, color: "#8a8b96" };
// Rampa monocromatica (sem verde), no espirito do lumni-sirius-app.
const PALETTE = [
  "#f0f1f5",
  "#c7c8d0",
  "#9a9ba5",
  "#75767f",
  "#55565f",
  "#3d3e45",
  "#8a8b96",
  "#2a2b30",
];

function labelTick(value: string): string {
  return fmtDayLabel(value);
}

export function RequestsArea({ data }: { data: DayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="reqFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="day" tickFormatter={labelTick} tick={AXIS} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={44} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          itemStyle={TOOLTIP_ITEM_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          labelFormatter={labelTick}
          formatter={(value) => [fmtInt(Number(value)), "Requisicoes"]}
        />
        <Area type="monotone" dataKey="requests" stroke="#f0f1f5" strokeWidth={2} fill="url(#reqFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TokensBars({ data }: { data: DayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="day" tickFormatter={labelTick} tick={AXIS} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={44} tickFormatter={(v) => fmtInt(Number(v))} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          itemStyle={TOOLTIP_ITEM_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          labelFormatter={labelTick}
          formatter={(value, name) => [
            fmtInt(Number(value)),
            name === "inputTokens" ? "Entrada" : "Saida",
          ]}
        />
        <Legend
          wrapperStyle={LEGEND_STYLE}
          formatter={(name) => (name === "inputTokens" ? "Entrada" : "Saida")}
        />
        <Bar dataKey="inputTokens" stackId="t" fill="#e8e9ee" />
        <Bar dataKey="outputTokens" stackId="t" fill="#6b6c78" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LatencyLine({ data }: { data: DayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="day" tickFormatter={labelTick} tick={AXIS} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={44} tickFormatter={(v) => `${Number(v).toFixed(1)}s`} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          itemStyle={TOOLTIP_ITEM_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          labelFormatter={labelTick}
          formatter={(value) => [`${Number(value).toFixed(2)} s`, "Latencia media"]}
        />
        <Line type="monotone" dataKey="avgLatency" stroke="#8a8b96" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BreakdownDonut({ data }: { data: BreakdownItem[] }) {
  const grouped = groupTop(data, 7);
  if (grouped.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          itemStyle={TOOLTIP_ITEM_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          formatter={(value, name) => [fmtInt(Number(value)), String(name)]}
        />
        <Legend wrapperStyle={LEGEND_STYLE} />
        <Pie
          data={grouped}
          dataKey="requests"
          nameKey="label"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={2}
          stroke="#050507"
        >
          {grouped.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BreakdownBars({ data }: { data: BreakdownItem[] }) {
  const grouped = groupTop(data, 10);
  if (grouped.length === 0) return <Empty />;
  const height = Math.max(160, grouped.length * 34 + 24);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={grouped} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={130}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          itemStyle={TOOLTIP_ITEM_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          cursor={{ fill: "rgba(255,255,255,0.06)" }}
          formatter={(value) => [fmtInt(Number(value)), "Requisicoes"]}
        />
        <Bar dataKey="requests" radius={[0, 4, 4, 0]}>
          {grouped.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function groupTop(data: BreakdownItem[], top: number): BreakdownItem[] {
  const sorted = [...data].sort((a, b) => b.requests - a.requests);
  if (sorted.length <= top) return sorted;
  const head = sorted.slice(0, top);
  const rest = sorted.slice(top);
  const other = rest.reduce(
    (acc, item) => ({
      label: "Outros",
      requests: acc.requests + item.requests,
      totalTokens: acc.totalTokens + item.totalTokens,
    }),
    { label: "Outros", requests: 0, totalTokens: 0 } as BreakdownItem,
  );
  return [...head, other];
}

function Empty() {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-faint">
      Sem dados no periodo.
    </div>
  );
}
