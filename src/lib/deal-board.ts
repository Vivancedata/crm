import { DEAL_STAGE_LABELS } from "@/lib/constants";

/**
 * The board's stages, in pipeline order. WON and LOST are deliberately absent:
 * a closed deal is a record, not a column you drag things into.
 */
export const ACTIVE_STAGES = [
  "LEAD",
  "QUALIFIED",
  "DISCOVERY",
  "PROPOSAL",
  "NEGOTIATION",
] as const;

export type ActiveStage = (typeof ACTIVE_STAGES)[number];
export type DealStage = keyof typeof DEAL_STAGE_LABELS;

export function isActiveStage(stage: string): stage is ActiveStage {
  return (ACTIVE_STAGES as readonly string[]).includes(stage);
}

/**
 * What the board needs about a deal, as plain JSON.
 *
 * The page used to hand Prisma models straight to a client component, which
 * meant `value` crossed the boundary as a `Decimal` instance -- React warns
 * ("Only plain objects can be passed to Client Components") and the field
 * arrives as a stringified object. Serialising here makes the contract
 * explicit and the numbers real numbers.
 */
export interface BoardDeal {
  id: string;
  title: string;
  stage: DealStage;
  value: number | null;
  companyName: string | null;
  contactName: string | null;
  expectedClose: string | null;
  /** When the deal last entered its current stage; the deal's own creation if it never moved. */
  stageSince: string;
  /** The most recent activity of any kind, or null if nothing has happened yet. */
  lastActivityAt: string | null;
}

/** Whole days between `from` and now, floored at 0. */
export function daysSince(from: string | Date, now: Date = new Date()): number {
  const then = new Date(from).getTime();
  return Math.max(0, Math.floor((now.getTime() - then) / 86_400_000));
}

/**
 * "3 days", "1 day", "today" -- the age of a card, phrased to sit after a
 * label like "In stage". Deliberately not `formatRelativeDate`, which rounds
 * a fortnight to "2 weeks ago" and hides exactly the drift this is here to show.
 */
export function formatDayCount(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "1 day";
  return `${days} days`;
}
