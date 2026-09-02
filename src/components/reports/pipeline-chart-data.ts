export interface PipelineStageData {
  name: string;
  stage: string;
  count: number;
  value: number;
}

export const STAGE_KEYS = [
  "LEAD",
  "QUALIFIED",
  "DISCOVERY",
  "PROPOSAL",
  "NEGOTIATION",
] as const;

/** The legend swatches. Same `--stage-*` tokens the bars read, as utilities. */
export const STAGE_SWATCH: Record<string, string> = {
  LEAD: "bg-stage-lead",
  QUALIFIED: "bg-stage-qualified",
  DISCOVERY: "bg-stage-discovery",
  PROPOSAL: "bg-stage-proposal",
  NEGOTIATION: "bg-stage-negotiation",
};
