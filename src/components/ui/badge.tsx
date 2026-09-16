import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "accent" | "positive" | "critical";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-elevated text-muted",
  accent: "border-accent/40 bg-accent-soft text-ink",
  positive: "border-positive/40 bg-positive/10 text-positive",
  critical: "border-critical/40 bg-critical/10 text-critical",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone };

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
