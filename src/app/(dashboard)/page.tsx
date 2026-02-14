import { DashboardStats } from "@/components/dashboard/stats";
import { PipelineOverview } from "@/components/dashboard/pipeline-overview";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-2 font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s what&apos;s happening with your pipeline.
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PipelineOverview />
        <UpcomingTasks />
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
