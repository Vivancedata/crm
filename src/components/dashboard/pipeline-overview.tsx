"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StageBadge } from "@/components/deals/stage-badge";
import { formatCurrency } from "@/lib/utils";
import type { DEAL_STAGE_LABELS } from "@/lib/constants";

interface PipelineStage {
  stage: keyof typeof DEAL_STAGE_LABELS;
  count: number;
  value: number;
}

interface PipelineOverviewProps {
  stages: PipelineStage[];
}

export function PipelineOverview({ stages }: PipelineOverviewProps) {
  const totalValue = stages.reduce((acc, stage) => acc + stage.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage) => {
            const percentage = totalValue > 0 ? (stage.value / totalValue) * 100 : 0;

            return (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StageBadge stage={stage.stage} />
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
