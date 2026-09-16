import type { Metadata } from "next";
import { CheckoutButton } from "@/components/checkout-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

export default async function PremiumPage() {
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
    <div className="mx-auto w-full max-w-2xl px-4 py-20">
      <h1 className="text-3xl sm:text-4xl">One plan, one price</h1>
      <p className="mt-3 text-muted">
        Start free. Upgrade when the free plan stops being enough.
      </p>

      <Card className="mt-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Premium</h2>
            <p className="mt-1 text-sm text-muted">Billed monthly. Cancel any time.</p>
          </div>
          {active ? <Badge tone="positive">Active</Badge> : null}
        </div>

        <ul className="mt-6 flex flex-col gap-2 text-sm text-ink">
          {included.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          {active ? (
            <p className="text-sm text-muted">
              You are on Premium. Nothing to do here.
            </p>
          ) : (
            <CheckoutButton enabled={canCheckout} />
          )}
        </div>
      </Card>

      <p className="mt-6 text-sm text-muted">
        Prices come from Stripe. This page never hardcodes an amount, so changing the
        price in Stripe changes it everywhere.
      </p>
    </div>
  );
}
