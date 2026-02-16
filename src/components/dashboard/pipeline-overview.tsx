"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface PipelineStage {
  name: string;
  count: number;
  value: number;
  variant: "lead" | "qualified" | "discovery" | "proposal" | "negotiation";
}

interface PipelineOverviewProps {
  stages: PipelineStage[];
}

export function PipelineOverview({ stages }: PipelineOverviewProps) {
  const totalValue = stages.reduce((acc, stage) => acc + stage.value, 0);

  return (
    <Card variant="neu">
      <CardHeader>
        <CardTitle>Pipeline Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage) => {
            const percentage = totalValue > 0 ? (stage.value / totalValue) * 100 : 0;

            return (
              <div key={stage.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={stage.variant}>{stage.name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {stage.count} deals
                    </span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(stage.value)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <span className="font-medium">Total Pipeline Value</span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(totalValue)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
