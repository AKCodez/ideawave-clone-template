"use client";

import { useActionState, type ReactElement } from "react";
import { createSnippet } from "@/app/(app)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/input";
import { initialFormState } from "@/lib/form-state";

export function SnippetForm(): ReactElement {
  const [state, formAction, pending] = useActionState(createSnippet, initialFormState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field
        id="snippet-title"
        label="Title"
        error={state.status === "error" ? state.message : undefined}
      >
        <Input name="title" required maxLength={120} placeholder="What is this about?" />
      </Field>

      <Field
        id="snippet-source"
        label="Source text"
        hint="At least a paragraph. Transcripts, threads and notes all work."
      >
        <Textarea
          name="source"
          required
          minLength={20}
          rows={5}
          placeholder="Paste the transcript, the thread or the notes."
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending}>
          {pending ? "Saving" : "Save snippet"}
        </Button>
        {state.status === "error" ? null : (
          <FormMessage status={state.status} message={state.message} />
        )}
      </div>
    </form>
  );
}
