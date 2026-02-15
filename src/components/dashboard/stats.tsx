"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { 
  TrendingUp, 
  Users, 
  Briefcase,
  DollarSign
} from "lucide-react";

const stats = [
  {
    name: "Pipeline Value",
    value: "$247,500",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: DollarSign,
  },
  {
    name: "Active Deals",
    value: "23",
    change: "+4",
    changeType: "positive" as const,
    icon: Briefcase,
  },
  {
    name: "New Contacts",
    value: "18",
    change: "+7 this week",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    name: "Win Rate",
    value: "34%",
    change: "+2.1%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
];

export function DashboardStats() {
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
            <div className="mt-2">
              <span
                className={
                  stat.changeType === "positive"
                    ? "text-success text-sm font-medium"
                    : "text-destructive text-sm font-medium"
                }
              >
                {stat.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
