"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GripVertical, MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { updateDealStage } from "@/lib/actions/deals";
import { DEAL_STAGE_LABELS } from "@/lib/constants";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Deal, Company, Contact } from "@prisma/client";

type DealWithRelations = Deal & {
  company: Company | null;
  contact: Contact | null;
};

const ACTIVE_STAGES = ["LEAD", "QUALIFIED", "DISCOVERY", "PROPOSAL", "NEGOTIATION"] as const;

interface DealCardProps {
  deal: DealWithRelations;
  isDragOverlay?: boolean;
}

export function DealCard({ deal, isDragOverlay = false }: DealCardProps) {
  const router = useRouter();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: deal.id,
    data: { deal },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  async function handleStageChange(newStage: Deal["stage"]) {
    try {
      const result = await updateDealStage(deal.id, newStage);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update deal stage");
        return;
      }
      toast.success(`Deal moved to ${DEAL_STAGE_LABELS[newStage]}`);
    } catch {
      toast.error("Failed to update deal stage");
    }
  }

  function handleCardClick() {
    if (!isDragging) {
      router.push(`/deals/${deal.id}`);
    }
  }

  return (
    <div
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={style}
      className={isDragging ? "opacity-50" : undefined}
    >
      <Card
        variant="neu"
        className={`cursor-pointer hover:shadow-neu-lg transition-shadow ${
          isDragOverlay ? "shadow-neu-lg ring-2 ring-primary/20 rotate-[2deg]" : ""
        }`}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              {/* Drag Handle */}
              <button
                className="mt-0.5 cursor-grab rounded p-0.5 text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
                {...(!isDragOverlay ? { ...attributes, ...listeners } : {})}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium truncate">{deal.title}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {deal.company?.name ?? "No company"}
                </p>
              </div>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded p-1 hover:bg-accent">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Move to Stage</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ACTIVE_STAGES.filter((s) => s !== deal.stage).map((stage) => (
                    <DropdownMenuItem
                      key={stage}
                      onClick={() => handleStageChange(stage)}
                    >
                      {DEAL_STAGE_LABELS[stage]}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleStageChange("WON")}
                    className="text-success"
                  >
                    Mark as Won
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStageChange("LOST")}
                    className="text-destructive"
                  >
                    Mark as Lost
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground truncate">
              {deal.contact
                ? `${deal.contact.firstName} ${deal.contact.lastName}`
                : "No contact"}
            </span>
            <span className="font-semibold text-primary">
              {deal.value ? formatCurrency(Number(deal.value)) : "-"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
