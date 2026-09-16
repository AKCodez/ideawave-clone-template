/**
 * Shared return shape for every Server Action a form calls.
 *
 * It lives here rather than beside the actions because a "use server" module
 * may only export async functions - a constant in one is a build error.
 */
export type FormState = {
  /**
   * - `idle` nothing has been submitted yet
   * - `ok` the write succeeded and everything the action promised happened
   * - `degraded` the write succeeded but an optional step did not: the row is
   *   saved, the AI summary is missing. Render `<AiNotice />` next to the
   *   message, never an error - the user got what they asked for.
   * - `error` nothing was written; `message` says why in the user's terms
   */
  status: "idle" | "ok" | "degraded" | "error";
  message: string;
};

export const initialFormState: FormState = { status: "idle", message: "" };
