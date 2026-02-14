"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const pipelineStages = [
  { name: "Lead", count: 8, value: 45000, variant: "lead" as const },
  { name: "Qualified", count: 5, value: 72500, variant: "qualified" as const },
  { name: "Discovery", count: 4, value: 55000, variant: "discovery" as const },
  { name: "Proposal", count: 3, value: 42000, variant: "proposal" as const },
  { name: "Negotiation", count: 2, value: 33000, variant: "negotiation" as const },
];

export function PipelineOverview() {
  const totalValue = pipelineStages.reduce((acc, stage) => acc + stage.value, 0);

  return (
    <Card variant="neu">
      <CardHeader>
        <CardTitle>Pipeline Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pipelineStages.map((stage) => {
            const percentage = (stage.value / totalValue) * 100;
            
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
