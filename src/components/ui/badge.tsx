import type { HTMLAttributes, ReactElement } from "react";
import { clsx } from "clsx";

/**
 * A short status label. `sticker` is the loud one: a rotated, stamped label
 * that reads as something pressed onto the page. The per-direction stamp lives
 * in components.css under `.sticker`.
 */
export type BadgeTone = "neutral" | "accent" | "positive" | "warning" | "critical";
export type BadgeVariant = "soft" | "sticker";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-elevated text-muted",
  accent: "border-accent/40 bg-accent-soft text-ink",
  positive: "border-positive/40 bg-positive/10 text-positive",
  warning: "border-warning/40 bg-warning/10 text-warning",
  critical: "border-critical/40 bg-critical/10 text-critical",
};

const stickerTones: Record<BadgeTone, string> = {
  neutral: "border-line-strong bg-elevated text-ink",
  accent: "border-accent bg-accent text-on-accent",
  positive: "border-positive bg-positive/15 text-positive",
  warning: "border-warning bg-warning/15 text-warning",
  critical: "border-critical bg-critical/15 text-critical",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  variant?: BadgeVariant;
};

export function Badge({
  tone = "neutral",
  variant = "soft",
  className,
  ...props
}: BadgeProps): ReactElement {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 font-medium",
        variant === "sticker"
          ? ["sticker rounded-sm border-(length:--stroke-strong) px-2.5 py-1 text-caption", stickerTones[tone]]
          : ["rounded-full border-(length:--stroke) px-2.5 py-0.5 text-caption", tones[tone]],
        className,
      )}
      {...props}
    />
  );
}
