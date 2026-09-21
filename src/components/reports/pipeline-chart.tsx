"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STAGE_SWATCH, type PipelineStageData } from "./pipeline-chart-data";

/**
 * One dynamic import for the whole recharts subtree, not one per component.
 *
 * The per-component spelling is what made the bars black: recharts finds
 * `<Cell>` children by component identity, and `dynamic(() => Cell)` is a
 * different component, so the fills were dropped. See pipeline-chart-canvas.
 */
const PipelineChartCanvas = dynamic(() => import("./pipeline-chart-canvas"), {
  ssr: false,
  loading: () => <div className="h-[300px]" />,
});

export function PipelineChart({ data }: { data: PipelineStageData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="flex h-[300px] items-center justify-center text-muted-foreground">
            No deals in the pipeline yet.
          </p>
        ) : (
          <>
            <PipelineChartCanvas data={data} />

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {data.map((stage) => (
                <div key={stage.stage} className="flex items-center gap-2 text-sm">
                  <span
                    aria-hidden="true"
                    className={`h-3 w-3 rounded-full ${STAGE_SWATCH[stage.stage] ?? STAGE_SWATCH.LEAD}`}
                  />
                  <span className="text-muted-foreground">
                    {stage.name}: {stage.count}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
