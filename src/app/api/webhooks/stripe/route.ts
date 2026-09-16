import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { env, features } from "@/lib/env";
import { stripe } from "@/lib/stripe";

/**
 * The only writer of Subscription and user.premiumUntil.
 *
 * The signature is verified against the raw request body - never parse the JSON
 * first. Unhandled event types return 200 so Stripe stops retrying them.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!features.stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature." }, { status: 400 });
  }

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("[stripe] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (userId && subscriptionId) {
          const subscription = await stripe().subscriptions.retrieve(subscriptionId);
          await mirrorSubscription(userId, subscription);
          const customerId =
            typeof session.customer === "string" ? session.customer : session.customer?.id;
          if (customerId) {
            await db.user.update({
              where: { id: userId },
              data: { stripeCustomerId: customerId },
            });
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const existing = await db.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
          select: { userId: true },
        });
        if (existing) await mirrorSubscription(existing.userId, subscription);
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`[stripe] failed to handle ${event.type}`, error);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/** Stripe is the source of truth; this copies its state into our tables. */
async function mirrorSubscription(
  userId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const item = subscription.items.data[0];
  const priceId = item?.price.id ?? "";
  const periodEndSeconds = item?.current_period_end ?? null;
  const currentPeriodEnd = periodEndSeconds ? new Date(periodEndSeconds * 1000) : null;
  const active = subscription.status === "active" || subscription.status === "trialing";

  await db.subscription.upsert({
    where: { userId },
    update: {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      priceId,
      currentPeriodEnd,
    },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      priceId,
      currentPeriodEnd,
    },
  });

  await db.user.update({
    where: { id: userId },
    data: { premiumUntil: active ? currentPeriodEnd : null },
  });
}
