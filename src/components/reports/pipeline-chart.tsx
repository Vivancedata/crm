"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface PipelineStageData {
  name: string;
  stage: string;
  count: number;
  value: number;
}

interface PipelineChartProps {
  data: PipelineStageData[];
}

const STAGE_COLORS: Record<string, string> = {
  LEAD: "#64748b",
  QUALIFIED: "#3b82f6",
  DISCOVERY: "#a855f7",
  PROPOSAL: "#f59e0b",
  NEGOTIATION: "#f97316",
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PipelineStageData }>;
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-medium">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        {data.count} {data.count === 1 ? "deal" : "deals"}
      </p>
      <p className="text-sm font-medium text-primary">
        {formatCurrency(data.value)}
      </p>
    </div>
  );
}

export function PipelineChart({ data }: PipelineChartProps) {
  if (data.length === 0) {
    return (
      <Card variant="neu">
        <CardHeader>
          <CardTitle>Pipeline by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No deals in the pipeline yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="neu">
      <CardHeader>
        <CardTitle>Pipeline by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <XAxis
              type="number"
              tickFormatter={(v) => formatCurrency(v)}
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
              {data.map((entry) => (
                <Cell
                  key={entry.stage}
                  fill={STAGE_COLORS[entry.stage] || "#64748b"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {data.map((stage) => (
            <div
              key={stage.stage}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    STAGE_COLORS[stage.stage] || "#64748b",
                }}
              />
              <span className="text-muted-foreground">
                {stage.name}: {stage.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
