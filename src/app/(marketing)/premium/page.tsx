import type { Metadata } from "next";
import type { ReactElement } from "react";
import { CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { CheckoutButton } from "@/components/checkout-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import { getCurrentUser } from "@/lib/session";
import { canCheckout } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pricing",
  description: "One paid plan. Cancel from the billing portal whenever you like.",
};

const included = [
  "Unlimited records",
  "Everything on the free plan",
  "Email support",
] as const;

export default async function PremiumPage(): Promise<ReactElement> {
  const user = await getCurrentUser();

  const subscription =
    user && features.db
      ? await db.subscription.findUnique({
          where: { userId: user.id },
          select: { status: true, currentPeriodEnd: true },
        })
      : null;

  const active = subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <div className="mx-auto w-full max-w-content px-4 py-section sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-h1 text-ink">One plan, one price</h1>
        <p className="max-w-prose text-lead text-muted">
          Start free. Upgrade when the free plan stops being enough.
        </p>
      </header>

      <Card className="mt-block max-w-prose">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle>Premium</CardTitle>
            {active ? <Badge tone="positive">Active</Badge> : null}
          </div>
          <p className="mt-1.5 text-small text-muted">Billed monthly. Cancel any time.</p>
        </CardHeader>

        <ul className="flex flex-col gap-2.5">
          {included.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-small text-ink">
              <CheckIcon
                aria-hidden="true"
                weight="bold"
                className="mt-1 size-3.5 shrink-0 text-accent"
              />
              {item}
            </li>
          ))}
        </ul>

        <CardFooter>
          {active ? (
            <p className="text-small text-muted">You are on Premium. Nothing to do here.</p>
          ) : (
            <CheckoutButton enabled={canCheckout} />
          )}
        </CardFooter>
      </Card>

      <p className="mt-6 max-w-prose text-small text-muted">
        Prices come from Stripe. This page never hardcodes an amount, so changing the price
        in Stripe changes it everywhere.
      </p>
    </div>
  );
}
