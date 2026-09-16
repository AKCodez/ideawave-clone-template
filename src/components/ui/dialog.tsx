"use client";

import {
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { clsx } from "clsx";
import { XIcon } from "@phosphor-icons/react/dist/ssr";

/**
 * The native <dialog>, opened with showModal().
 *
 * That buys the whole contract for free: the top layer (so a blurred or
 * filtered ancestor can never clip or trap it, which is why no portal is
 * needed), the focus trap, Escape, inert background, and focus returning to
 * whatever was focused when it opened. The scrim is ::backdrop, painted with
 * --color-overlay in components.css.
 */
let lockCount = 0;

function lockScroll(): () => void {
  lockCount += 1;
  document.documentElement.style.overflow = "hidden";
  return () => {
    lockCount -= 1;
    if (lockCount <= 0) {
      lockCount = 0;
      document.documentElement.style.overflow = "";
    }
  };
}

export type DialogVariant = "center" | "sheet";

export type DialogProps = {
  open: boolean;
  /** Called for every close: the close button, Escape, or the scrim. */
  onClose: () => void;
  /** Names the dialog. Pass `hideTitle` to keep it for screen readers only. */
  title: string;
  hideTitle?: boolean;
  /** "sheet" is the full-height panel that slides in from the right. */
  variant?: DialogVariant;
  children: ReactNode;
  className?: string;
};

export function Dialog({
  open,
  onClose,
  title,
  hideTitle = false,
  variant = "center",
  children,
  className,
}: DialogProps): ReactElement {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
    if (!open) return;
    return lockScroll();
  }, [open]);

  function handleClose(): void {
    if (open) onClose();
  }

  function handleScrim(event: MouseEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) onClose();
  }

  const sheet = variant === "sheet";

  return (
    <dialog ref={ref} className="dlg" aria-labelledby={titleId} onClose={handleClose}>
      <div
        onClick={handleScrim}
        className={clsx("flex h-full w-full", sheet ? "justify-end" : "items-center justify-center p-4")}
      >
        <div
          className={clsx(
            sheet
              ? "dlg-panel-sheet flex h-full w-full max-w-xs flex-col border-l-(length:--stroke) border-line bg-canvas"
              : "dlg-panel w-full max-w-lg rounded-xl border-(length:--stroke) border-line bg-elevated shadow-4",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 p-5">
            <h2 id={titleId} className={clsx("text-h3 text-ink", hideTitle && "sr-only")}>
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="btn btn-ghost -m-1 inline-flex size-8 shrink-0 items-center justify-center rounded-input text-muted hover:bg-surface hover:text-ink"
            >
              <XIcon aria-hidden="true" weight="bold" className="size-4" />
            </button>
          </div>
          <div className={clsx("px-5 pb-5", sheet && "flex-1 overflow-y-auto")}>{children}</div>
        </div>
      </div>
    </dialog>
  );
}

export function DialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement {
  return (
    <div
      className={clsx(
        "mt-6 flex flex-wrap items-center justify-end gap-3 border-t-(length:--stroke) border-line pt-5",
        className,
      )}
      {...props}
    />
  );
}
