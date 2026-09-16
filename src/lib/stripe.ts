import Stripe from "stripe";
import { env, features } from "@/lib/env";

let client: Stripe | null = null;

/**
 * Stripe SDK, constructed on first use. Callers must check `features.stripe`
 * first; this throws rather than silently talking to an unconfigured account.
 */
export function stripe(): Stripe {
  if (!features.stripe) {
    throw new Error("STRIPE_SECRET_KEY is not set - Stripe is not configured.");
  }
  client ??= new Stripe(env.STRIPE_SECRET_KEY);
  return client;
}

/** Checkout is only offered when both a secret key and a price exist. */
export const canCheckout: boolean = features.stripe && env.STRIPE_PRICE_ID.length > 0;
