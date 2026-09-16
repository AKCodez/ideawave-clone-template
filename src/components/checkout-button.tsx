"use client";

import { useActionState, type ReactElement } from "react";
import { startCheckout } from "@/app/(marketing)/premium/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/input";
import { initialFormState } from "@/lib/form-state";

export function CheckoutButton({ enabled }: { enabled: boolean }): ReactElement {
  const [state, formAction, pending] = useActionState(startCheckout, initialFormState);

  return (
    <div className="w-full">
      <form action={formAction}>
        <Button
          type="submit"
          size="lg"
          disabled={!enabled}
          loading={pending}
          className="w-full"
        >
          {pending ? "Opening checkout" : "Upgrade"}
        </Button>
      </form>

      {enabled ? null : (
        <p className="mt-3 text-small text-muted">
          Checkout is off until STRIPE_SECRET_KEY and STRIPE_PRICE_ID are set.
        </p>
      )}

      <FormMessage status={state.status} message={state.message} className="mt-3" />
    </div>
  );
}
