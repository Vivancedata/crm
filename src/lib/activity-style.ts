import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileSignature,
  FileText,
  Mail,
  Phone,
  Send,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon and colour for an activity type, in one place.
 *
 * Both `recent-activity.tsx` and `activity-timeline.tsx` carried their own
 * identical copies of these two maps, so the dashboard and a record's timeline
 * were one careless edit away from disagreeing about what an email looks like.
 *
 * The colours were eight raw palette hues (blue, purple, green, gray, emerald,
 * amber, indigo, teal) for eight enum values -- a hue per row, signifying
 * nothing. They are now four semantic tokens grouped by what the row means:
 * a conversation, a step forward, something finished, a note. `warning` is
 * deliberately absent: `text-warning` measures 2.00:1 on a light card.
 */
const CONVERSATION = "bg-info/10 text-info";
const PROGRESS = "bg-brand/10 text-brand";
const DONE = "bg-success/10 text-success";
const NEUTRAL = "bg-muted text-muted-foreground";

interface ActivityStyle {
  icon: LucideIcon;
  chip: string;
  label: string;
}

export const ACTIVITY_STYLE: Record<string, ActivityStyle> = {
  CALL: { icon: Phone, chip: CONVERSATION, label: "Call" },
  EMAIL: { icon: Mail, chip: CONVERSATION, label: "Email" },
  MEETING: { icon: Calendar, chip: CONVERSATION, label: "Meeting" },
  NOTE: { icon: FileText, chip: NEUTRAL, label: "Note" },
  TASK_COMPLETED: { icon: CheckCircle2, chip: DONE, label: "Task Completed" },
  DEAL_STAGE_CHANGE: { icon: ArrowRight, chip: PROGRESS, label: "Stage Change" },
  PROPOSAL_SENT: { icon: Send, chip: PROGRESS, label: "Proposal Sent" },
  CONTRACT_SIGNED: { icon: FileSignature, chip: DONE, label: "Contract Signed" },
};

export function activityStyle(type: string): ActivityStyle {
  return ACTIVITY_STYLE[type] ?? { icon: FileText, chip: NEUTRAL, label: type };
}
