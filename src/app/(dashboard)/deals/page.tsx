import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Mock data - Kanban style pipeline
const pipeline = {
  lead: [
    { id: 1, title: "AI Workflow Automation", company: "Martinez Construction", value: 15000, contact: "Carlos Martinez" },
    { id: 2, title: "Data Analytics Setup", company: "Valley Plumbing", value: 8000, contact: "Tom Wilson" },
  ],
  qualified: [
    { id: 3, title: "AI Customer Service", company: "Green Valley HVAC", value: 25000, contact: "Sarah Johnson" },
    { id: 4, title: "Process Automation", company: "Metro Electric", value: 18000, contact: "James Brown" },
  ],
  discovery: [
    { id: 5, title: "Inventory AI", company: "Smith Logistics", value: 32000, contact: "David Smith" },
  ],
  proposal: [
    { id: 6, title: "Full AI Integration", company: "TechStart Inc", value: 45000, contact: "Mike Chen" },
    { id: 7, title: "Training Program", company: "BuildRight Co", value: 12000, contact: "Amy Clark" },
  ],
  negotiation: [
    { id: 8, title: "Enterprise Package", company: "Precision Manufacturing", value: 75000, contact: "Jennifer Lee" },
  ],
};

const stageConfig = {
  lead: { label: "Lead", color: "bg-slate-500" },
  qualified: { label: "Qualified", color: "bg-blue-500" },
  discovery: { label: "Discovery", color: "bg-purple-500" },
  proposal: { label: "Proposal", color: "bg-amber-500" },
  negotiation: { label: "Negotiation", color: "bg-orange-500" },
};

export default function DealsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 font-bold">Deals</h1>
          <p className="text-muted-foreground">
            Track and manage your sales pipeline
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Deal
        </Button>
      </div>

      {/* Pipeline Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Object.entries(pipeline).map(([stage, deals]) => {
          const config = stageConfig[stage as keyof typeof stageConfig];
          const totalValue = deals.reduce((acc, deal) => acc + deal.value, 0);

          return (
            <div key={stage} className="w-80 flex-shrink-0">
              {/* Stage Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${config.color}`} />
                  <h3 className="font-semibold">{config.label}</h3>
                  <Badge variant="outline" className="ml-1">
                    {deals.length}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(totalValue)}
                </span>
              </div>

              {/* Deals */}
              <div className="space-y-3">
                {deals.map((deal) => (
                  <Card key={deal.id} variant="neu" className="cursor-pointer hover:shadow-neu-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{deal.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {deal.company}
                          </p>
                        </div>
                        <button className="rounded p-1 hover:bg-accent">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {deal.contact}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(deal.value)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add Deal Button */}
                <button className="w-full rounded-lg border-2 border-dashed border-muted-foreground/25 p-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  + Add Deal
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
