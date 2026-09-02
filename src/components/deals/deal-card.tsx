"use client";

import { useState } from "react";
import Link from "next/link";
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
import { MarkLostDialog } from "@/components/deals/mark-lost-dialog";
import { CalendarClock, Clock3, GripVertical, MoreHorizontal } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { updateDealStage } from "@/lib/actions/deals";
import { DEAL_STAGE_LABELS } from "@/lib/constants";
import {
  ACTIVE_STAGES,
  daysSince,
  formatDayCount,
  type BoardDeal,
  type DealStage,
} from "@/lib/deal-board";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DealCardProps {
  deal: BoardDeal;
  isDragOverlay?: boolean;
}

export function DealCard({ deal, isDragOverlay = false }: DealCardProps) {
  const [lostOpen, setLostOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { deal },
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  async function handleStageChange(newStage: DealStage) {
    try {
      const result = await updateDealStage(deal.id, newStage);
      if (!result.success) {
        toast.error(result.error ?? "Couldn't move that deal.");
        return;
      }
      toast.success(`Deal moved to ${DEAL_STAGE_LABELS[newStage]}`);
    } catch {
      toast.error("Couldn't move that deal.");
    }
  }

  const inStage = daysSince(deal.stageSince);
  const lastTouch = deal.lastActivityAt ? daysSince(deal.lastActivityAt) : null;

  return (
    <div
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={style}
      className={isDragging ? "opacity-50" : undefined}
    >
      {/*
        The card used to be role="button" with two real <button>s inside it --
        invalid, and a screen reader announced one control where there are
        three. The title is now the link, and the grip and menu are its
        siblings, so every target is its own element.

        Hover shifts the hairline rather than blooming a shadow. The drag
        overlay is the one card that genuinely floats, so it is the one that
        earns elevation -- level 2, the ceiling in DESIGN.md.
      */}
      <Card
        className={`transition-colors hover:border-brand/40 focus-within:border-brand/40 ${
          isDragOverlay ? "shadow-elevation-2 ring-2 ring-brand/20 rotate-[2deg]" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <button
                type="button"
                aria-label={`Drag ${deal.title} to another stage`}
                className="mt-0.5 cursor-grab rounded-sm p-0.5 text-muted-foreground/50 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
                {...(!isDragOverlay ? { ...attributes, ...listeners } : {})}
              >
                <GripVertical aria-hidden="true" className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-medium">
                  <Link
                    href={`/deals/${deal.id}`}
                    className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {deal.title}
                  </Link>
                </h4>
                <p className="truncate text-sm text-muted-foreground">
                  {deal.companyName ?? "No company"}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Actions for ${deal.title}`}
                  className="rounded-sm p-1 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MoreHorizontal aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Move to Stage</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ACTIVE_STAGES.filter((s) => s !== deal.stage).map((stage) => (
                  <DropdownMenuItem key={stage} onClick={() => handleStageChange(stage)}>
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
                {/*
                  Marking a deal lost without recording why threw away the only
                  thing the record is later worth. The schema has had a
                  lostReason field all along; nothing on the board asked for it.
                */}
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    setLostOpen(true);
                  }}
                  className="text-destructive"
                >
                  Mark as Lost&hellip;
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="truncate text-sm text-muted-foreground">
              {deal.contactName ?? "No contact"}
            </span>
            <span className="font-semibold text-brand">
              {deal.value === null ? "-" : formatCurrency(deal.value)}
            </span>
          </div>

          {/*
            What a founder needs on a Monday: how long this has sat, when it is
            meant to close, and whether anyone has touched it. None of it was on
            the card, so the board could not answer "what went quiet".
          */}
          <dl className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock3 aria-hidden="true" className="h-3 w-3" />
              <dt className="sr-only">Time in stage</dt>
              <dd>In stage {formatDayCount(inStage)}</dd>
            </div>
            {deal.expectedClose ? (
              <div className="flex items-center gap-1">
                <CalendarClock aria-hidden="true" className="h-3 w-3" />
                <dt className="sr-only">Expected close</dt>
                <dd>Closes {formatDate(deal.expectedClose)}</dd>
              </div>
            ) : null}
            <div>
              <dt className="sr-only">Last activity</dt>
              <dd>
                {lastTouch === null
                  ? "No activity yet"
                  : `Last activity ${formatDayCount(lastTouch)}${lastTouch === 0 ? "" : " ago"}`}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <MarkLostDialog
        open={lostOpen}
        onOpenChange={setLostOpen}
        dealId={deal.id}
        dealTitle={deal.title}
      />
    </div>
  );
}
