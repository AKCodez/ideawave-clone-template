import type { ReactElement, ReactNode } from "react";
import { clsx } from "clsx";

/**
 * The top of every page inside the app shell: what this page is, one line about
 * it, and the actions that belong to the whole page rather than to one row.
 */
export type PageHeaderProps = {
  title: string;
  description?: string;
  /** Buttons for the page as a whole. Put row-level actions in the row. */
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps): ReactElement {
  return (
    <div
      className={clsx(
        "flex flex-wrap items-end justify-between gap-4 border-b-(length:--stroke) border-line pb-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-h2 text-ink">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-prose text-small text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
