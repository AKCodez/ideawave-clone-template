"use client";

import { useActionState } from "react";
import { startCheckout } from "@/app/premium/actions";
import { Button } from "@/components/ui/button";
import { initialFormState } from "@/lib/form-state";

export function CheckoutButton({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState(startCheckout, initialFormState);

  return (
    <div>
      <form action={formAction}>
        <Button type="submit" size="lg" disabled={!enabled || pending} className="w-full">
          {pending ? "Opening checkout..." : "Upgrade"}
        </Button>
      </form>

      {!enabled ? (
        <p className="mt-3 text-sm text-muted">
          Checkout is off until STRIPE_SECRET_KEY and STRIPE_PRICE_ID are set.
        </p>
      ) : null}

      {state.message ? (
        <p role="alert" className="mt-3 text-sm text-critical">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
