"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DealCard } from "@/components/deals/deal-card";
import { formatCurrency } from "@/lib/utils";
import { updateDealStage } from "@/lib/actions/deals";
import { DEAL_STAGE_LABELS } from "@/lib/constants";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import type { Deal, Company, Contact } from "@prisma/client";

type DealWithRelations = Deal & {
  company: Company | null;
  contact: Contact | null;
};

const KANBAN_STAGES = [
  { key: "LEAD", label: "Lead", color: "bg-slate-500", variant: "lead" as const },
  { key: "QUALIFIED", label: "Qualified", color: "bg-blue-500", variant: "qualified" as const },
  { key: "DISCOVERY", label: "Discovery", color: "bg-purple-500", variant: "discovery" as const },
  { key: "PROPOSAL", label: "Proposal", color: "bg-amber-500", variant: "proposal" as const },
  { key: "NEGOTIATION", label: "Negotiation", color: "bg-orange-500", variant: "negotiation" as const },
] as const;

type KanbanStageKey = (typeof KANBAN_STAGES)[number]["key"];

interface DealKanbanProps {
  deals: DealWithRelations[];
}

interface KanbanColumnProps {
  stageKey: string;
  label: string;
  color: string;
  deals: DealWithRelations[];
  isOver: boolean;
}

function KanbanColumn({ stageKey, label, color, deals, isOver }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: stageKey,
  });

  const totalValue = deals.reduce(
    (acc, d) => acc + (d.value ? Number(d.value) : 0),
    0
  );

  return (
    <div className="w-80 flex-shrink-0">
      {/* Stage Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${color}`} />
          <h3 className="font-semibold">{label}</h3>
          <Badge variant="outline" className="ml-1">
            {deals.length}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatCurrency(totalValue)}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`min-h-[200px] space-y-3 rounded-lg p-2 transition-colors ${
          isOver
            ? "bg-primary/5 ring-2 ring-primary/20 ring-dashed"
            : "bg-transparent"
        }`}
      >
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}

        {deals.length === 0 && (
          <div
            className={`rounded-lg border-2 border-dashed p-6 text-center text-sm transition-colors ${
              isOver
                ? "border-primary/40 text-primary"
                : "border-muted-foreground/25 text-muted-foreground"
            }`}
          >
            {isOver ? "Drop here" : "No deals"}
          </div>
        )}
      </div>
    </div>
  );
}

export function DealKanban({ deals }: DealKanbanProps) {
  const [activeDeal, setActiveDeal] = useState<DealWithRelations | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  // Require a minimum drag distance before activating to avoid
  // interfering with clicks on the card or dropdown menu
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const deal = event.active.data.current?.deal as DealWithRelations | undefined;
    if (deal) {
      setActiveDeal(deal);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const overId = event.over?.id as string | undefined;
    if (overId && KANBAN_STAGES.some((s) => s.key === overId)) {
      setOverColumn(overId);
    } else {
      setOverColumn(null);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDeal(null);
    setOverColumn(null);

    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const deal = active.data.current?.deal as DealWithRelations | undefined;
    const overId = over.id as string;
    const stage = KANBAN_STAGES.find((s) => s.key === overId)?.key;
    if (!stage) return;
    const newStage: KanbanStageKey = stage;

    // Only proceed if dropping on a valid stage column and it's different
    if (!deal) return;
    if (deal.stage === newStage) return;

    try {
      const result = await updateDealStage(dealId, newStage);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update deal stage");
        return;
      }
      toast.success(`Deal moved to ${DEAL_STAGE_LABELS[newStage]}`);
    } catch {
      toast.error("Failed to update deal stage");
    }
  }

  function handleDragCancel() {
    setActiveDeal(null);
    setOverColumn(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.key);

          return (
            <KanbanColumn
              key={stage.key}
              stageKey={stage.key}
              label={stage.label}
              color={stage.color}
              deals={stageDeals}
              isOver={overColumn === stage.key}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDeal ? (
          <div className="w-80">
            <DealCard deal={activeDeal} isDragOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
