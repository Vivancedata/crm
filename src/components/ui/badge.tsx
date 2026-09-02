import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        info: "border-transparent bg-info text-info-foreground",
        // Pipeline stages. One step darker than the -500 ramp they used to
        // sit on: white on amber-500 measured 2.15:1 and on orange-500 2.80:1,
        // both well under the 4.5:1 AA floor. These are 5.02:1 and 5.18:1,
        // and the family stays legible next to each other.
        lead: "border-transparent bg-slate-600 text-white",
        qualified: "border-transparent bg-blue-600 text-white",
        discovery: "border-transparent bg-purple-600 text-white",
        proposal: "border-transparent bg-amber-700 text-white",
        negotiation: "border-transparent bg-orange-700 text-white",
        won: "border-transparent bg-success text-success-foreground",
        lost: "border-transparent bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
