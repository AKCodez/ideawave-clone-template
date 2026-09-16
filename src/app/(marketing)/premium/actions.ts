"use server";

import { redirect } from "next/navigation";
import { appUrl, env } from "@/lib/env";
import type { FormState } from "@/lib/form-state";
import { getCurrentUser } from "@/lib/session";
import { canCheckout, stripe } from "@/lib/stripe";

/**
 * One price, one subscription. Everything no-ops with a readable message when
 * STRIPE_SECRET_KEY or STRIPE_PRICE_ID is missing.
 */
export async function startCheckout(
  _prev: FormState,
  _formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  if (!canCheckout) {
    return {
      status: "error",
      message:
        "Billing is not configured yet. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID to turn checkout on.",
    };
  }

  let url: string | null = null;
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/premium?checkout=cancelled`,
      client_reference_id: user.id,
      customer_email: user.email,
      allow_promotion_codes: true,
    });
    url = session.url;
  } catch (error) {
    console.error("[stripe] could not create a checkout session", error);
    return { status: "error", message: "Stripe refused the checkout. Try again shortly." };
  }

  if (!url) {
    return { status: "error", message: "Stripe did not return a checkout URL." };
  }
  redirect(url);
}
