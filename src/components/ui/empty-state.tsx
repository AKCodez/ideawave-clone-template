import type { ReactElement, ReactNode } from "react";
import { clsx } from "clsx";

/**
 * The state a list is in before anyone has used it.
 *
 * `body` and `action` are required on purpose, and the type is the enforcement:
 * an empty state that does not say what will appear here, and does not offer
 * the one thing that makes it appear, will not compile. "No data" is not an
 * empty state.
 */
export type EmptyStateProps = {
  title: string;
  /** What will appear here, and what causes it. One or two short sentences. */
  body: string;
  /** The control that causes it. A Button, or a Button asChild wrapping a Link. */
  action: ReactNode;
  /** An icon element, sized by the caller. Decorative, never the only signal. */
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  body,
  action,
  icon,
  className,
}: EmptyStateProps): ReactElement {
  return (
    <div
      className={clsx(
        "flex flex-col items-center gap-4 rounded-lg border-(length:--stroke) border-dashed border-line bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="text-faint">
          {icon}
        </span>
      ) : null}
      <div className="flex flex-col items-center gap-2">
        <p className="text-h3 text-ink">{title}</p>
        <p className="max-w-prose text-small text-muted">{body}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">{action}</div>
    </div>
  );
}
