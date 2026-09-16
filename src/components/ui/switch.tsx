"use client";

import type { ReactElement } from "react";
import { clsx } from "clsx";

/**
 * A real switch: a button with role="switch" and aria-checked, which is what a
 * screen reader and a keyboard already understand. Only the thumb moves, and
 * only by transform.
 */
export type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Accessible name. Pass the visible label's text when the label is elsewhere. */
  label: string;
  id?: string;
  disabled?: boolean;
  className?: string;
};

export function Switch({
  checked,
  onCheckedChange,
  label,
  id,
  disabled = false,
  className,
}: SwitchProps): ReactElement {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={clsx(
        "btn inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5",
        "border-(length:--stroke)",
        checked ? "border-accent bg-accent" : "border-line bg-elevated",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "switch-thumb size-4 rounded-full",
          checked ? "translate-x-5 bg-on-accent" : "translate-x-0 bg-muted",
        )}
      />
    </button>
  );
}
