import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import brand from "@/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { WaitlistForm } from "@/components/waitlist-form";

/* Replace this copy with the promise of the product you are building. One
   headline, one sentence, three benefits. Do not turn it into a feature list,
   and do not invent a number you cannot show. */
const benefits = [
  {
    title: "One loop, not a tour",
    body: "A visitor can do the single valuable thing on their first visit. Everything else waits until that works.",
  },
  {
    title: "Reads on the server",
    body: "Pages query Postgres directly in server components. No spinner stands in for data the page already has.",
  },
  {
    title: "Honest when unconfigured",
    body: "Missing Stripe, email or database credentials turn a feature off with a clear message instead of a stack trace.",
  },
] as const;

export default function HomePage(): ReactElement {
  return (
    <div className="mx-auto w-full max-w-wide px-4 sm:px-6">
      <section className="flex flex-col items-start gap-6 py-section">
        <Badge tone="accent" variant="sticker">
          Starter template
        </Badge>

        <h1 className="max-w-content text-display text-ink">
          Ship the thing people came for, on day one.
        </h1>

        <p className="max-w-prose text-lead text-muted">{brand.tagline}</p>

        <WaitlistForm />

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button asChild variant="secondary" size="lg">
            <Link href="/sign-up">Create an account</Link>
          </Button>
          <Button asChild variant="link" size="lg">
            <Link href="/compare">
              See how it compares
              <ArrowRightIcon aria-hidden="true" weight="bold" className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 pb-section sm:grid-cols-3">
        {benefits.map((benefit) => (
          <Card key={benefit.title}>
            <CardTitle>{benefit.title}</CardTitle>
            <CardDescription>{benefit.body}</CardDescription>
          </Card>
        ))}
      </section>
    </div>
  );
}
