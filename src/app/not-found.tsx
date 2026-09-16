import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound(): ReactElement {
  return (
    <div className="mx-auto flex w-full max-w-prose flex-col items-start gap-6 px-4 py-section sm:px-6">
      <Link href="/" className="no-underline">
        <Wordmark size="sm" />
      </Link>

      <div className="flex flex-col gap-3">
        <p className="numeric text-caption text-faint">404</p>
        <h1 className="text-h1 text-ink">There is nothing at this address</h1>
        <p className="text-lead text-muted">
          The link may be old, or the page may have moved. Both of these still work.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="primary" size="md">
          <Link href="/">Go to the home page</Link>
        </Button>
        <Button asChild variant="secondary" size="md">
          <Link href="/dashboard">Open the dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
