"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
} from "lucide-react";

interface DashboardStatsProps {
  pipelineValue: number;
  activeDeals: number;
  newContactsThisWeek: number;
  winRate: number;
}

export function DashboardStats({
  pipelineValue,
  activeDeals,
  newContactsThisWeek,
  winRate,
}: DashboardStatsProps) {
  const stats = [
    {
      name: "Pipeline Value",
      value: formatCurrency(pipelineValue),
      icon: DollarSign,
    },
    {
      name: "Active Deals",
      value: String(activeDeals),
      icon: Briefcase,
    },
    {
      name: "New Contacts",
      value: String(newContactsThisWeek),
      subtitle: "this week",
      icon: Users,
    },
    {
      name: "Win Rate",
      value: `${winRate}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} variant="neu">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            {stat.subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
