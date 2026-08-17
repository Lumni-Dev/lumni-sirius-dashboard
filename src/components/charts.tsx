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

const AXIS = { stroke: "#737373", fontSize: 11 };
const GRID = "#272727";
const TOOLTIP_STYLE = {
  background: "#1e1e1e",
  border: "1px solid #333333",
  borderRadius: "10px",
  color: "#f2f2f2",
  fontSize: "12px",
};
const LEGEND_STYLE = { fontSize: 12, color: "#a6a6a6" };
// Rampa monocromatica "ink" com o verde da marca como destaque.
const PALETTE = [
  "#f2f2f2",
  "#c9c9c9",
  "#a6a6a6",
  "#8a8a8a",
  "#6f6f6f",
  "#34c76c",
  "#565656",
  "#3f3f3f",
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
          labelFormatter={labelTick}
          formatter={(value) => [fmtInt(Number(value)), "Requisicoes"]}
        />
        <Area type="monotone" dataKey="requests" stroke="#f2f2f2" strokeWidth={2} fill="url(#reqFill)" />
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
        <Bar dataKey="inputTokens" stackId="t" fill="#e6e6e6" />
        <Bar dataKey="outputTokens" stackId="t" fill="#34c76c" radius={[3, 3, 0, 0]} />
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
          labelFormatter={labelTick}
          formatter={(value) => [`${Number(value).toFixed(2)} s`, "Latencia media"]}
        />
        <Line type="monotone" dataKey="avgLatency" stroke="#a6a6a6" strokeWidth={2} dot={false} />
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
          stroke="#141414"
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
