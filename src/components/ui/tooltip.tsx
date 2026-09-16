"use client";

import { cloneElement, isValidElement, useId, type ReactElement } from "react";
import { clsx } from "clsx";

/**
 * A hint attached to a control. It shows on hover and on keyboard focus, it is
 * announced through aria-describedby, and it never takes focus, so it cannot
 * trap anyone. Positioning is CSS (components.css, `.tip`), not a library.
 *
 * A tooltip is never the only place information lives. If the control needs the
 * words to be usable, put them on the page.
 */
type DescribedProps = { "aria-describedby"?: string };

export type TooltipProps = {
  /** The text shown in the bubble. Keep it to one short line. */
  label: string;
  side?: "top" | "bottom";
  children: ReactElement<DescribedProps>;
  className?: string;
};

export function Tooltip({ label, side = "top", children, className }: TooltipProps): ReactElement {
  const id = useId();

  const trigger = isValidElement<DescribedProps>(children)
    ? cloneElement(children, { "aria-describedby": id })
    : children;

  return (
    <span className={clsx("tip", className)}>
      {trigger}
      <span
        role="tooltip"
        id={id}
        data-side={side}
        className="tip-bubble w-max max-w-56 rounded-md border-(length:--stroke) border-line bg-elevated px-2.5 py-1.5 text-caption text-ink shadow-2"
      >
        {label}
      </span>
    </span>
  );
}
