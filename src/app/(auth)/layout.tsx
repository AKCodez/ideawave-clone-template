import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import brand from "@/brand";
import { Monogram } from "@/components/brand/monogram";
import { Wordmark } from "@/components/brand/wordmark";

/**
 * Sign in, sign up and password reset: the form on the left, the brand on the
 * right. Below lg the brand panel goes away entirely and only a small wordmark
 * stays, because on a phone the form is the whole job.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  const phrase = brand.voice.phrases[0];

  return (
    <div className="flex flex-1 flex-col lg:grid lg:grid-cols-2">
      <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-10">
        <Link href="/" className="no-underline">
          <Wordmark size="sm" />
        </Link>
        <main className="flex flex-1 items-center py-10">
          <div className="mx-auto w-full max-w-prose">{children}</div>
        </main>
      </div>

      <aside className="hidden bg-accent-soft px-10 py-16 lg:flex lg:flex-col lg:justify-center lg:gap-8">
        <Monogram size="xl" />
        <p className="max-w-prose text-h2 text-ink">{brand.tagline}</p>
        {phrase ? <p className="max-w-prose text-lead text-muted">{phrase}</p> : null}
      </aside>
    </div>
  );
}
