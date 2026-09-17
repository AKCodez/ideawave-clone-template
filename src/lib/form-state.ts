/**
 * Shared return shape for every Server Action a form calls.
 *
 * It lives here rather than beside the actions because a "use server" module
 * may only export async functions - a constant in one is a build error.
 */
export type FormState = {
  /**
   * - `idle` nothing has been submitted yet
   * - `ok` everything the action promised happened
   * - `degraded` what the user pressed the button for happened, but an
   *   optional step did not - a row saved without its AI summary, say. Render
   *   `<AiNotice />` beside the message, never an error: the user got the
   *   thing they asked for.
   * - `error` the action did not do what it promised; `message` says why in
   *   the user's terms
   *
   * `message` must only ever claim what THIS action did. In an action whose
   * whole job is the optional step - a standalone Summarise button on a row
   * that is already saved - a failure means nothing happened at all, so the
   * copy says "Summaries need a key", never "Saved, but ...". Nothing was
   * saved by that click, and a message that says otherwise is a small lie the
   * user can catch.
   */
  status: "idle" | "ok" | "degraded" | "error";
  message: string;
};

export const initialFormState: FormState = { status: "idle", message: "" };
