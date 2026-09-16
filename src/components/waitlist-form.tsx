"use client";

import { useActionState, type ReactElement } from "react";
import { useFormStatus } from "react-dom";
import { joinWaitlist } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { FormMessage, Input } from "@/components/ui/input";
import { initialFormState } from "@/lib/form-state";

function SubmitButton(): ReactElement {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} className="sm:w-auto">
      {pending ? "Adding" : "Join the waitlist"}
    </Button>
  );
}

export function WaitlistForm(): ReactElement {
  const [state, formAction] = useActionState(joinWaitlist, initialFormState);

  return (
    <div className="w-full max-w-prose">
      <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          aria-label="Email address"
          className="h-12"
        />
        <SubmitButton />
      </form>
      <FormMessage status={state.status} message={state.message} className="mt-2" />
    </div>
  );
}
