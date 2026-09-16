import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { CheckoutButton } from "@/components/checkout-button";
import { Faq, Pricing } from "@/components/sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { faqs, plans, pricingNote, type Plan } from "@/content/marketing";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import { getCurrentUser } from "@/lib/session";
import { canCheckout } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pricing",
  description: "One paid plan. Cancel from the billing portal whenever you like.",
};

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

  /* The free plan links to sign-up; the paid one opens Stripe Checkout, or says
     plainly that it is already active. The amount always comes from Stripe. */
  function actionFor(plan: Plan): ReactNode {
    if (!plan.featured) {
      return (
        <Button asChild variant="secondary" size="lg" className="w-full">
          <Link href="/sign-up">Start free</Link>
        </Button>
      );
    }
    if (active) {
      return <Badge tone="positive">Active on your account</Badge>;
    }
    return <CheckoutButton enabled={canCheckout} />;
  }

  return (
    <>
      <Pricing
        plans={plans}
        note={pricingNote}
        eyebrow="Pricing"
        title="One plan, one price"
        description="Start free. Upgrade when the free plan stops being enough."
        action={actionFor}
      />

      <Faq items={faqs} title="Questions about billing and everything else" />
    </>
  );
}
