/**
 * The pipeline-stage variants that used to live here (lead, qualified,
 * discovery, proposal, negotiation, won, lost) are a CRM concept, not a design
 * system one -- the marketing site has no pipeline. They now live in
 * <StageBadge> (src/components/deals/stage-badge.tsx), on tokens.
 */
export { Badge, badgeVariants, type BadgeProps } from "@vivancedata/ui";
