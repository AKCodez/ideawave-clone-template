"use client";

import { useActionState, type ReactElement } from "react";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import { summariseSnippet } from "@/app/(app)/dashboard/actions";
import { AiNotice } from "@/components/ai-notice";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/input";
import { initialFormState } from "@/lib/form-state";

/**
 * The one button that calls a model, and the shape every AI control in this
 * product should copy.
 *
 * The row is already saved before this is pressed, so the only thing at stake
 * is the summary. When AI is switched off or the call fails, the action returns
 * `"degraded"` and this renders a notice rather than an error: nothing the user
 * did went wrong, and nothing they typed was lost.
 */
export function SnippetSummarise({ id }: { id: string }): ReactElement {
  const [state, formAction, pending] = useActionState(summariseSnippet, initialFormState);

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <Button type="submit" variant="ghost" size="sm" loading={pending}>
          <SparkleIcon aria-hidden="true" weight="regular" className="size-4" />
          <span className="sr-only sm:not-sr-only">Summarise</span>
        </Button>
      </form>

      {state.status === "degraded" ? (
        <AiNotice message={state.message} className="mt-0 max-w-[22rem] text-right" />
      ) : null}
      {state.status === "error" ? <FormMessage status={state.status} message={state.message} /> : null}
    </div>
  );
}
