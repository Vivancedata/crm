"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { STAGE_KEYS, type PipelineStageData } from "./pipeline-chart-data";

/**
 * The recharts half of the pipeline chart, in its own module so the page can
 * pull it in with a single `dynamic(..., { ssr: false })`.
 *
 * It used to be seven separate dynamic() wrappers, one per recharts component,
 * inside pipeline-chart.tsx. That is why the bars were black: recharts matches
 * `<Cell>` children by component identity, and a next/dynamic wrapper is a
 * different component, so every `fill` was silently dropped. The same pattern
 * is still in activity-chart, revenue-chart and lead-source-chart -- their
 * Cells do not colour either.
 *
 * `fill` also has to be a resolved colour: it lands as an SVG presentation
 * attribute, and those do not resolve `var()`. Hence reading the `--stage-*`
 * tokens off the root element. This module only ever runs in the browser, so
 * the read is safe on first render and there is no uncoloured frame.
 */
function stageColors(): Record<string, string> {
  const root = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    STAGE_KEYS.map((key) => [
      key,
      `hsl(${root.getPropertyValue(`--stage-${key.toLowerCase()}`).trim()})`,
    ])
  );
}

function PipelineTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PipelineStageData }>;
}) {
  if (!active || !payload?.length) return null;
  const stage = payload[0].payload;

  return (
    <div className="rounded-md border border-border bg-background p-3 shadow-1">
      <p className="font-medium">{stage.name}</p>
      <p className="text-sm text-muted-foreground">
        {stage.count} {stage.count === 1 ? "deal" : "deals"}
      </p>
      <p className="text-sm font-medium text-brand">{formatCurrency(stage.value)}</p>
    </div>
  );
}

export default function PipelineChartCanvas({ data }: { data: PipelineStageData[] }) {
  const colors = stageColors();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <XAxis
          type="number"
          tickFormatter={(v: number | string) => formatCurrency(Number(v))}
          tick={{ fontSize: 12 }}
        />
        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
        <Tooltip content={<PipelineTooltip />} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
          {data.map((entry) => (
            <Cell key={entry.stage} fill={colors[entry.stage] ?? colors.LEAD} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
