import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Plan } from "@/content/marketing";
import { tokens } from "@/design/tokens";
import { Section, SectionHeader } from "./section";

/**
 * Pricing: the plans, side by side, with the featured one visually lifted.
 *
 * The featured plan carries the accent border and accent-soft ground of the
 * accent card tone, a sticker that says why it is the default, and the
 * direction's own elevation. The price is the loudest type on the page.
 *
 * `action` renders the plan's button, so a route that knows about Stripe can
 * pass a checkout button while a static page falls back to a link to sign up.
 * Nothing here ever hardcodes an amount: `plan.price` is a string the content
 * file owns.
 *
 * Direction behaviour it carries: the featured lift is `shadow-3` on editorial
 * and craft, the lit ring `shadow-glow` on luminous, and the flat offset
 * `shadow-hard` on brutal, where a blurred shadow would read as a mistake.
 */

const direction = tokens.direction.key;

const FEATURED_LIFT =
  direction === "luminous" ? "shadow-glow" : direction === "brutal" ? "shadow-hard" : "shadow-3";

/** Column counts, spelled out so Tailwind can see every class it must emit. */
function gridFor(count: number): string {
  if (count <= 1) return "mx-auto w-full max-w-prose";
  if (count === 2) return "md:grid-cols-2";
  return "md:grid-cols-2 lg:grid-cols-3";
}

export type PricingProps = {
  plans: readonly Plan[];
  /** One line under the cards. Where the number comes from, what it excludes. */
  note?: string;
  eyebrow?: string;
  /** Omit to render the cards with no header at all. */
  title?: string;
  description?: string;
  id?: string;
  /** `h1` when this section leads the page, which is the case on /premium. */
  as?: "h1" | "h2";
  /** The plan's button. Defaults to a link to /sign-up. */
  action?: (plan: Plan) => ReactNode;
};

export function Pricing({
  plans,
  note,
  eyebrow,
  title,
  description,
  id,
  as = "h2",
  action,
}: PricingProps): ReactElement {
  return (
    <Section id={id}>
      {title ? <SectionHeader eyebrow={eyebrow} title={title} description={description} as={as} /> : null}

      <div className={clsx("grid gap-6", gridFor(plans.length), title && "mt-stack")}>
        {plans.map((plan) => (
          <Card
            key={plan.name}
            tone={plan.featured ? "accent" : "neutral"}
            className={clsx("flex h-full flex-col", plan.featured && FEATURED_LIFT)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>{plan.name}</CardTitle>
                {plan.featured ? (
                  <Badge tone="accent" variant="sticker">
                    Recommended
                  </Badge>
                ) : null}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <p className="numeric text-display text-ink">{plan.price}</p>
            <p className="mt-1 text-small text-muted">{plan.cadence}</p>

            <ul className="mt-6 flex flex-1 flex-col gap-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-small text-ink">
                  <CheckIcon
                    aria-hidden="true"
                    weight="bold"
                    className="mt-1 size-3.5 shrink-0 text-accent"
                  />
                  {feature}
                </li>
              ))}
            </ul>

            <CardFooter>
              {action ? (
                action(plan)
              ) : (
                <Button asChild variant={plan.featured ? "primary" : "secondary"} size="md">
                  <Link href="/sign-up">Create an account</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {note ? <p className="mt-6 max-w-prose text-small text-muted">{note}</p> : null}
    </Section>
  );
}
