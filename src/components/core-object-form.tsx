"use client";

import { useActionState } from "react";
import { createCoreObject } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialFormState } from "@/lib/form-state";

export function CoreObjectForm() {
  const [state, formAction, pending] = useActionState(
    createCoreObject,
    initialFormState,
  );

  return (
    <div>
      <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="title"
          required
          maxLength={120}
          placeholder="Name the thing you are tracking"
          aria-label="Title"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add"}
        </Button>
      </form>
      {state.message ? (
        <p
          role="status"
          className={state.status === "error" ? "mt-2 text-sm text-critical" : "mt-2 text-sm text-positive"}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
