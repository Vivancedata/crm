"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SourceData {
  name: string;
  value: number;
}

interface WeeklyData {
  week: string;
  count: number;
}

interface LeadSourceChartProps {
  bySource: SourceData[];
  byWeek: WeeklyData[];
}

const SOURCE_COLORS: Record<string, string> = {
  Website: "#3b82f6",
  Referral: "#10b981",
  LinkedIn: "#0077b5",
  "Cold Outreach": "#f59e0b",
  Event: "#a855f7",
  Advertisement: "#ec4899",
  Other: "#64748b",
};

const COLOR_PALETTE = [
  "#3b82f6",
  "#10b981",
  "#0077b5",
  "#f59e0b",
  "#a855f7",
  "#ec4899",
  "#64748b",
];

function SourceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: SourceData }>;
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-medium">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        {data.value} {data.value === 1 ? "contact" : "contacts"}
      </p>
    </div>
  );
}

function WeekTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-medium">Week of {label}</p>
      <p className="text-sm text-muted-foreground">
        {payload[0].value} new {payload[0].value === 1 ? "contact" : "contacts"}
      </p>
    </div>
  );
}

export function LeadSourceChart({ bySource, byWeek }: LeadSourceChartProps) {
  const hasSourceData = bySource.length > 0;
  const hasWeekData = byWeek.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card variant="neu">
        <CardHeader>
          <CardTitle>Contacts by Source</CardTitle>
        </CardHeader>
        <CardContent>
          {hasSourceData ? (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={bySource}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {bySource.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          SOURCE_COLORS[entry.name] ||
                          COLOR_PALETTE[index % COLOR_PALETTE.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<SourceTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {bySource.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          SOURCE_COLORS[entry.name] ||
                          COLOR_PALETTE[index % COLOR_PALETTE.length],
                      }}
                    />
                    <span className="text-muted-foreground">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No contact source data available.
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="neu">
        <CardHeader>
          <CardTitle>New Contacts (Last 12 Weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          {hasWeekData ? (
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={byWeek}>
                <defs>
                  <linearGradient id="contactGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  allowDecimals={false}
                />
                <Tooltip content={<WeekTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#contactGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[340px] items-center justify-center text-muted-foreground">
              No recent contact data.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
