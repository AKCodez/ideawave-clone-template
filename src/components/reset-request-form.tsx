"use client";

import { useActionState, type ReactElement } from "react";
import { requestPasswordReset } from "@/app/(auth)/forgot-password/actions";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/input";
import { initialFormState } from "@/lib/form-state";

export function ResetRequestForm(): ReactElement {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field
        id="reset-email"
        label="Email"
        error={state.status === "error" ? state.message : undefined}
      >
        <Input name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
      </Field>

      {state.status === "error" ? null : (
        <FormMessage status={state.status} message={state.message} />
      )}

      <Button type="submit" size="lg" loading={pending} className="w-full">
        {pending ? "Sending" : "Send reset link"}
      </Button>
    </form>
  );
}
