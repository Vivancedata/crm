"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface ClosedDeal {
  id: string;
  title: string;
  stage: "WON" | "LOST";
  value: number | null;
  companyName: string | null;
  closedAt: string;
  lostReason: string | null;
}

/**
 * Won and lost deals were fetched by the page and then dropped on the floor:
 * they were filtered out of the board and never rendered anywhere, so the only
 * evidence they existed was the count they were missing from. They do not
 * belong in a column -- nothing gets dragged out of "Won" -- so they are a
 * list, collapsed by default, under the board.
 */
export function ClosedDeals({ deals }: { deals: ClosedDeal[] }) {
  const [open, setOpen] = useState(false);

  if (deals.length === 0) return null;

  const won = deals.filter((d) => d.stage === "WON");
  const wonValue = won.reduce((acc, d) => acc + (d.value ?? 0), 0);

  return (
    <section className="rounded-md border border-border bg-card">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="closed-deals-list"
          className="flex w-full items-center gap-2 rounded-md px-4 py-3 text-left text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {open ? (
            <ChevronDown aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          )}
          Closed
          <span className="font-normal text-muted-foreground">
            {won.length} won &middot; {formatCurrency(wonValue)} &middot;{" "}
            {deals.length - won.length} lost
          </span>
        </button>
      </h2>

      <ul id="closed-deals-list" hidden={!open} className="divide-y divide-border border-t border-border">
        {deals.map((deal) => (
          <li key={deal.id} className="flex items-baseline gap-3 px-4 py-3 text-sm">
            <Badge variant={deal.stage === "WON" ? "won" : "lost"}>
              {deal.stage === "WON" ? "Won" : "Lost"}
            </Badge>
            <Link
              href={`/deals/${deal.id}`}
              className="min-w-0 flex-1 truncate font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {deal.title}
              {deal.companyName ? (
                <span className="font-normal text-muted-foreground"> · {deal.companyName}</span>
              ) : null}
              {deal.stage === "LOST" && deal.lostReason ? (
                <span className="font-normal text-muted-foreground"> · {deal.lostReason}</span>
              ) : null}
            </Link>
            <span className="whitespace-nowrap text-muted-foreground">
              {formatDate(deal.closedAt)}
            </span>
            <span className="w-24 whitespace-nowrap text-right font-medium">
              {deal.value === null ? "-" : formatCurrency(deal.value)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
