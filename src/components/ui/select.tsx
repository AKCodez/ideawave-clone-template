import type { ReactElement, SelectHTMLAttributes } from "react";
import { clsx } from "clsx";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";

/**
 * A native <select> wearing the tokens. No JS, no listbox to keyboard-trap: the
 * platform already knows how to open one of these on every device.
 */
export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  /** Class for the wrapper, when the select needs to sit in a grid cell. */
  wrapperClassName?: string;
};

export function Select({ className, wrapperClassName, ...props }: SelectProps): ReactElement {
  return (
    <div className={clsx("relative inline-flex w-full items-center", wrapperClassName)}>
      <select
        className={clsx(
          "h-10 w-full appearance-none rounded-input border-(length:--stroke) border-line bg-surface",
          "pr-9 pl-3 text-small text-ink",
          "transition-colors duration-(--duration-1) ease-out-soft",
          "hover:border-line-strong focus:border-accent",
          "aria-[invalid=true]:border-critical",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <CaretDownIcon
        aria-hidden="true"
        weight="bold"
        className="pointer-events-none absolute right-3 size-4 text-muted"
      />
    </div>
  );
}
