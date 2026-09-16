import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { WaitlistForm } from "@/components/waitlist-form";

/* Replace this copy with the promise of the product you are building. One
   headline, one sentence, three benefits - do not turn it into a feature list. */
const benefits = [
  {
    title: "One loop, not a tour",
    body: "A visitor can do the single valuable thing on their first visit. Everything else waits until that works.",
  },
  {
    title: "Reads on the server",
    body: "Pages query Postgres directly in server components. No loading spinners standing in for data you already have.",
  },
  {
    title: "Honest when unconfigured",
    body: "Missing Stripe, email or database credentials turn features off with a clear message instead of a stack trace.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <section className="flex flex-col items-start gap-6 py-20 sm:py-28">
        <Badge tone="accent">Starter template</Badge>
        <h1 className="max-w-3xl text-4xl leading-[1.08] text-balance sm:text-6xl">
          Ship the thing people came for, on day one.
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted">
          This is the scaffold, not the product. Auth, billing, email and the database are
          wired and verified so the only thing left to build is the loop your users
          actually return for.
        </p>
        <WaitlistForm />
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/sign-up" className={buttonClasses("secondary", "md")}>
            Create an account
          </Link>
          <Link href="/compare" className={buttonClasses("ghost", "md")}>
            See how it compares
          </Link>
        </div>
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-3">
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
