"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DealCard } from "@/components/deals/deal-card";
import { formatCurrency } from "@/lib/utils";
import { updateDealStage } from "@/lib/actions/deals";
import { DEAL_STAGE_LABELS } from "@/lib/constants";
import { ACTIVE_STAGES, isActiveStage, type ActiveStage, type BoardDeal } from "@/lib/deal-board";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type ClientRect,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";

/**
 * Left and right arrows move a picked-up card one column along the pipeline.
 *
 * dnd-kit's `sortableKeyboardCoordinates` is the usual answer, and it does not
 * work here: it only considers droppables that belong to a `SortableContext`,
 * and these columns are plain `useDroppable` targets. Wired up with it the card
 * could be picked up and dropped but never moved -- the live region kept
 * announcing the column it started in. Verified in the browser, not assumed.
 *
 * Up and down are deliberately inert. Position within a column is not stored,
 * so reordering there would be undone by the next reload.
 */
const boardKeyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { currentCoordinates, context }
) => {
  const step = event.code === "ArrowRight" ? 1 : event.code === "ArrowLeft" ? -1 : 0;
  if (step === 0) return undefined;
  event.preventDefault();

  const { collisionRect, droppableRects } = context;
  if (!collisionRect) return undefined;

  const columns = ACTIVE_STAGES.map((stage) => droppableRects.get(stage)).filter(
    (rect): rect is ClientRect => Boolean(rect)
  );
  if (columns.length === 0) return undefined;

  const cardCentre = collisionRect.left + collisionRect.width / 2;
  const current = columns.findIndex(
    (rect) => cardCentre >= rect.left && cardCentre <= rect.left + rect.width
  );
  const next = columns[(current === -1 ? (step > 0 ? -1 : columns.length) : current) + step];
  if (!next) return undefined;

  return {
    x: currentCoordinates.x + (next.left - collisionRect.left),
    y: currentCoordinates.y + (next.top - collisionRect.top),
  };
};

const STAGE_DOT: Record<ActiveStage, string> = {
  LEAD: "bg-slate-600",
  QUALIFIED: "bg-blue-600",
  DISCOVERY: "bg-purple-600",
  PROPOSAL: "bg-amber-700",
  NEGOTIATION: "bg-orange-700",
};

interface DealKanbanProps {
  deals: BoardDeal[];
}

interface KanbanColumnProps {
  stage: ActiveStage;
  deals: BoardDeal[];
  isOver: boolean;
}

function KanbanColumn({ stage, deals, isOver }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: stage });
  const label = DEAL_STAGE_LABELS[stage];
  const totalValue = deals.reduce((acc, d) => acc + (d.value ?? 0), 0);
  const headingId = `kanban-column-${stage}`;

  return (
    <section aria-labelledby={headingId} className="w-80 flex-shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className={`h-3 w-3 rounded-full ${STAGE_DOT[stage]}`} />
          <h3 id={headingId} className="font-semibold">
            {label}
          </h3>
          <Badge variant="outline" className="ml-1">
            {deals.length}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">{formatCurrency(totalValue)}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[200px] space-y-3 rounded-md p-2 transition-colors ${
          isOver ? "bg-brand/5 ring-2 ring-dashed ring-brand/20" : "bg-transparent"
        }`}
      >
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}

        {deals.length === 0 && (
          <p
            className={`rounded-md border-2 border-dashed p-6 text-center text-sm transition-colors ${
              isOver
                ? "border-brand/40 text-brand"
                : "border-muted-foreground/25 text-muted-foreground"
            }`}
          >
            {isOver ? "Drop here" : "No deals"}
          </p>
        )}
      </div>
    </section>
  );
}

export function DealKanban({ deals }: DealKanbanProps) {
  // A local mirror of the server's list so a dropped card stays where it was
  // dropped. Without it the card snapped back to its old column and sat there
  // until revalidatePath came round, which reads as "the drag failed".
  const [board, setBoard] = useState(deals);
  const [activeDeal, setActiveDeal] = useState<BoardDeal | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  // The server is the truth; adopt it whenever it sends a new list.
  useEffect(() => {
    setBoard(deals);
  }, [deals]);

  const sensors = useSensors(
    // Require a minimum drag distance before activating so a drag does not
    // swallow a click on the card's link or its menu.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    // Space picks a card up, left/right move it between columns, space drops
    // it. Without this the board was unusable without a mouse.
    useSensor(KeyboardSensor, { coordinateGetter: boardKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    const deal = event.active.data.current?.deal as BoardDeal | undefined;
    if (deal) setActiveDeal(deal);
  }

  function handleDragOver(event: DragOverEvent) {
    const overId = event.over?.id;
    setOverColumn(typeof overId === "string" && isActiveStage(overId) ? overId : null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const deal = event.active.data.current?.deal as BoardDeal | undefined;
    const overId = event.over?.id;

    setActiveDeal(null);
    setOverColumn(null);

    if (!deal || typeof overId !== "string" || !isActiveStage(overId)) return;
    if (deal.stage === overId) return;

    const nextStage: ActiveStage = overId;
    setBoard((current) =>
      current.map((d) => (d.id === deal.id ? { ...d, stage: nextStage } : d))
    );

    try {
      const result = await updateDealStage(deal.id, nextStage);
      if (!result.success) {
        setBoard(deals);
        toast.error(result.error ?? "Couldn't move that deal.");
        return;
      }
      toast.success(`Deal moved to ${DEAL_STAGE_LABELS[nextStage]}`);
    } catch {
      setBoard(deals);
      toast.error("Couldn't move that deal.");
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
      accessibility={{
        screenReaderInstructions: {
          draggable:
            "Press space to pick up this deal, the left and right arrow keys to move it between pipeline stages, space again to drop it, and escape to cancel.",
        },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {ACTIVE_STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            deals={board.filter((d) => d.stage === stage)}
            isOver={overColumn === stage}
          />
        ))}
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
