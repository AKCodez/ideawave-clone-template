import { cn } from "@/lib/utils";

export type AiNoticeProps = {
  /** What actually happened, in the user's terms. Comes from `FormState.message`. */
  message?: string;
  className?: string;
};

/**
 * The line a form shows when `FormState.status` is `"degraded"`: the write went
 * through, the model step did not.
 *
 * It is a notice, not an error. It never blocks, never replaces the result, and
 * never asks the user to do anything they did not come here to do - the row is
 * already saved and the summary can be written later or by hand.
 *
 * ```tsx
 * {state.status === "degraded" ? <AiNotice message={state.message} /> : null}
 * ```
 */
export function AiNotice({ message, className }: AiNoticeProps) {
  return (
    <p
      role="status"
      className={cn("mt-2 flex items-start gap-2 text-small text-warning", className)}
    >
      <span aria-hidden="true">&bull;</span>
      <span>{message ?? "Saved. The summary is not available right now."}</span>
    </p>
  );
}
