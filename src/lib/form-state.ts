/**
 * Shared return shape for every Server Action a form calls.
 *
 * It lives here rather than beside the actions because a "use server" module
 * may only export async functions - a constant in one is a build error.
 */
export type FormState = {
  status: "idle" | "ok" | "error";
  message: string;
};

export const initialFormState: FormState = { status: "idle", message: "" };
