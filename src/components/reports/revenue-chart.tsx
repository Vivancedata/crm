"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCard } from "@/components/reports/stats-card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, Target } from "lucide-react";

interface ServiceTypeData {
  name: string;
  value: number;
}

interface MonthlyRevenue {
  month: string;
  value: number;
}

interface RevenueChartProps {
  totalWonValue: number;
  avgDealSize: number;
  winRate: number;
  byServiceType: ServiceTypeData[];
  byMonth: MonthlyRevenue[];
}

const SERVICE_COLORS: Record<string, string> = {
  Consulting: "#3b82f6",
  "AI Integration": "#a855f7",
  Training: "#f59e0b",
  Support: "#10b981",
  "Custom Development": "#ec4899",
};

const COLOR_PALETTE = [
  "#3b82f6",
  "#a855f7",
  "#f59e0b",
  "#10b981",
  "#ec4899",
];

function ServiceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ServiceTypeData }>;
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-medium">{data.name}</p>
      <p className="text-sm font-medium text-primary">
        {formatCurrency(data.value)}
      </p>
    </div>
  );
}

function MonthTooltip({
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
      <p className="text-sm font-medium text-primary">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function RevenueChart({
  totalWonValue,
  avgDealSize,
  winRate,
  byServiceType,
  byMonth,
}: RevenueChartProps) {
  const hasServiceData = byServiceType.length > 0;
  const hasMonthData = byMonth.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Won Revenue"
          value={formatCurrency(totalWonValue)}
          subtitle="from closed deals"
          icon={DollarSign}
          trend={totalWonValue > 0 ? "up" : "neutral"}
        />
        <StatsCard
          title="Average Deal Size"
          value={formatCurrency(avgDealSize)}
          subtitle="per won deal"
          icon={TrendingUp}
          trend={avgDealSize > 0 ? "up" : "neutral"}
        />
        <StatsCard
          title="Win Rate"
          value={`${winRate}%`}
          subtitle="of closed deals"
          icon={Target}
          trend={winRate >= 50 ? "up" : winRate > 0 ? "down" : "neutral"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="neu">
          <CardHeader>
            <CardTitle>Revenue by Service Type</CardTitle>
          </CardHeader>
          <CardContent>
            {hasServiceData ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={byServiceType}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip content={<ServiceTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                      {byServiceType.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            SERVICE_COLORS[entry.name] ||
                            COLOR_PALETTE[index % COLOR_PALETTE.length]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {byServiceType.map((entry, index) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            SERVICE_COLORS[entry.name] ||
                            COLOR_PALETTE[index % COLOR_PALETTE.length],
                        }}
                      />
                      <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No deal revenue data yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="neu">
          <CardHeader>
            <CardTitle>Won Revenue (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {hasMonthData ? (
              <ResponsiveContainer width="100%" height={340}>
                <AreaChart data={byMonth}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v)}
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip content={<MonthTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[340px] items-center justify-center text-muted-foreground">
                No won deals yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
