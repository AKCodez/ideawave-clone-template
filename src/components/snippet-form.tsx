"use client";

import { useActionState } from "react";
import { createSnippet } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialFormState } from "@/lib/form-state";

export function SnippetForm() {
  const [state, formAction, pending] = useActionState(createSnippet, initialFormState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input name="title" required maxLength={120} placeholder="What is this about?" aria-label="Title" />
      <textarea
        name="source"
        required
        minLength={20}
        rows={4}
        placeholder="Paste the transcript, the thread or the notes."
        aria-label="Source text"
        className="w-full rounded-input border border-line bg-surface px-3 py-2 text-small text-ink placeholder:text-faint"
      />
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save snippet"}
      </Button>
      {state.message ? (
        <p role="status" className={state.status === "error" ? "text-small text-critical" : "text-small text-positive"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
