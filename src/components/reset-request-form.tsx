"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/forgot-password/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { initialFormState } from "@/lib/form-state";

export function ResetRequestForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
        />
      </div>

      {state.message ? (
        <p
          role="status"
          className={state.status === "error" ? "text-sm text-critical" : "text-sm text-positive"}
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
