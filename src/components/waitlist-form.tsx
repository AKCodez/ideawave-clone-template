"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinWaitlist } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialFormState } from "@/lib/form-state";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="sm:w-auto">
      {pending ? "Adding..." : "Join the waitlist"}
    </Button>
  );
}

export function WaitlistForm() {
  const [state, formAction] = useActionState(joinWaitlist, initialFormState);

  return (
    <div className="w-full max-w-md">
      <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          aria-label="Email address"
        />
        <SubmitButton />
      </form>
      {state.message ? (
        <p
          role="status"
          className={
            state.status === "error"
              ? "mt-2 text-sm text-critical"
              : "mt-2 text-sm text-positive"
          }
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
