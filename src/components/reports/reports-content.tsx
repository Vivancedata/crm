"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PipelineChart } from "@/components/reports/pipeline-chart";
import { ActivityChart } from "@/components/reports/activity-chart";
import { LeadSourceChart } from "@/components/reports/lead-source-chart";
import { RevenueChart } from "@/components/reports/revenue-chart";

interface PipelineStageData {
  name: string;
  stage: string;
  count: number;
  value: number;
}

interface ActivityByType {
  name: string;
  value: number;
}

interface ActivityByDay {
  date: string;
  count: number;
}

interface SourceData {
  name: string;
  value: number;
}

interface WeeklyData {
  week: string;
  count: number;
}

interface ServiceTypeData {
  name: string;
  value: number;
}

interface MonthlyRevenue {
  month: string;
  value: number;
}

interface ReportsContentProps {
  pipelineData: PipelineStageData[];
  activityByType: ActivityByType[];
  activityByDay: ActivityByDay[];
  leadBySource: SourceData[];
  leadByWeek: WeeklyData[];
  totalWonValue: number;
  avgDealSize: number;
  winRate: number;
  revenueByService: ServiceTypeData[];
  revenueByMonth: MonthlyRevenue[];
}

export function ReportsContent({
  pipelineData,
  activityByType,
  activityByDay,
  leadBySource,
  leadByWeek,
  totalWonValue,
  avgDealSize,
  winRate,
  revenueByService,
  revenueByMonth,
}: ReportsContentProps) {
  return (
    <Tabs defaultValue="pipeline" className="space-y-6">
      <TabsList>
        <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="leads">Leads</TabsTrigger>
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
      </TabsList>

      <TabsContent value="pipeline">
        <PipelineChart data={pipelineData} />
      </TabsContent>

      <TabsContent value="activity">
        <ActivityChart byType={activityByType} byDay={activityByDay} />
      </TabsContent>

      <TabsContent value="leads">
        <LeadSourceChart bySource={leadBySource} byWeek={leadByWeek} />
      </TabsContent>

      <TabsContent value="revenue">
        <RevenueChart
          totalWonValue={totalWonValue}
          avgDealSize={avgDealSize}
          winRate={winRate}
          byServiceType={revenueByService}
          byMonth={revenueByMonth}
        />
      </TabsContent>
    </Tabs>
  );
}
