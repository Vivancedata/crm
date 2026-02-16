"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ActivityByType {
  name: string;
  value: number;
}

interface ActivityByDay {
  date: string;
  count: number;
}

interface ActivityChartProps {
  byType: ActivityByType[];
  byDay: ActivityByDay[];
}

const ACTIVITY_COLORS: Record<string, string> = {
  Call: "#3b82f6",
  Email: "#8b5cf6",
  Meeting: "#f59e0b",
  Note: "#64748b",
  "Task Completed": "#10b981",
  "Stage Change": "#f97316",
  "Proposal Sent": "#ec4899",
  "Contract Signed": "#06b6d4",
};

const COLOR_PALETTE = [
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#64748b",
  "#10b981",
  "#f97316",
  "#ec4899",
  "#06b6d4",
];

function TypeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ActivityByType }>;
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-medium">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        {data.value} {data.value === 1 ? "activity" : "activities"}
      </p>
    </div>
  );
}

function DayTooltip({
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
      <p className="font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">
        {payload[0].value} {payload[0].value === 1 ? "activity" : "activities"}
      </p>
    </div>
  );
}

export function ActivityChart({ byType, byDay }: ActivityChartProps) {
  const hasTypeData = byType.length > 0;
  const hasDayData = byDay.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card variant="neu">
        <CardHeader>
          <CardTitle>Activities by Type</CardTitle>
        </CardHeader>
        <CardContent>
          {hasTypeData ? (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={byType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {byType.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          ACTIVITY_COLORS[entry.name] ||
                          COLOR_PALETTE[index % COLOR_PALETTE.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<TypeTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {byType.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          ACTIVITY_COLORS[entry.name] ||
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
              No activities recorded yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="neu">
        <CardHeader>
          <CardTitle>Daily Activity (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {hasDayData ? (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={byDay}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  allowDecimals={false}
                />
                <Tooltip content={<DayTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[340px] items-center justify-center text-muted-foreground">
              No recent activity data.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
