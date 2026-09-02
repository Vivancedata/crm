import { Badge } from "@/components/ui/badge";
import { DEAL_STAGE_LABELS } from "@/lib/constants";

type Stage = keyof typeof DEAL_STAGE_LABELS;

/**
 * A deal's stage as a chip.
 *
 * This used to be seven extra variants bolted onto the shared Badge -- and
 * five of them were raw Tailwind palette classes (`bg-amber-500 text-white`),
 * so the design system's own Badge could not be adopted without dragging a
 * CRM concept into it. The stage ramp is app-level (see `--stage-*` in
 * globals.css); Won and Lost are just the system's success and destructive.
 */
const STAGE_CLASS: Record<Stage, string> = {
  LEAD: "border-transparent bg-stage-lead text-white",
  QUALIFIED: "border-transparent bg-stage-qualified text-white",
  DISCOVERY: "border-transparent bg-stage-discovery text-white",
  PROPOSAL: "border-transparent bg-stage-proposal text-white",
  NEGOTIATION: "border-transparent bg-stage-negotiation text-white",
  WON: "",
  LOST: "",
};

export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  const variant = stage === "WON" ? "success" : stage === "LOST" ? "destructive" : "default";

  return (
    <Badge variant={variant} className={[STAGE_CLASS[stage], className].filter(Boolean).join(" ")}>
      {DEAL_STAGE_LABELS[stage]}
    </Badge>
  );
}

/** The same ramp as a bare colour, for the dot on a kanban column header. */
export const STAGE_DOT_CLASS: Record<Exclude<Stage, "WON" | "LOST">, string> = {
  LEAD: "bg-stage-lead",
  QUALIFIED: "bg-stage-qualified",
  DISCOVERY: "bg-stage-discovery",
  PROPOSAL: "bg-stage-proposal",
  NEGOTIATION: "bg-stage-negotiation",
};
