import type { HTMLAttributes, ReactElement } from "react";
import { clsx } from "clsx";

/**
 * A panel. `interactive` is for a card that is itself a link or a button: it
 * adds the direction's hover and press affordance from components.css.
 */
export type CardTone = "neutral" | "accent" | "critical";

const tones: Record<CardTone, string> = {
  neutral: "border-line bg-surface",
  accent: "border-accent/40 bg-accent-soft",
  critical: "border-critical/40 bg-critical/10",
};

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: CardTone;
  interactive?: boolean;
};

export function Card({
  tone = "neutral",
  interactive = false,
  className,
  ...props
}: CardProps): ReactElement {
  return (
    <div
      className={clsx(
        "rounded-lg border-(length:--stroke) p-6",
        tones[tone],
        interactive && "card-interactive",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>): ReactElement {
  return <div className={clsx("mb-5 flex flex-col", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>): ReactElement {
  return (
    <div
      className={clsx(
        "mt-6 flex flex-wrap items-center gap-3 border-t-(length:--stroke) border-line pt-5",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>): ReactElement {
  return <h3 className={clsx("text-h3 text-ink", className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>): ReactElement {
  return <p className={clsx("mt-1.5 text-small text-muted", className)} {...props} />;
}
