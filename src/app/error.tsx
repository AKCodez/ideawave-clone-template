"use client";

import { useEffect, type ReactElement } from "react";
import Link from "next/link";
import { WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

/**
 * A page threw. Say so plainly, offer the retry that React already gives us,
 * and leave a way out of the page that broke.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): ReactElement {
  useEffect(() => {
    console.error("[app] unhandled error", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-prose flex-col items-start gap-6 px-4 py-section sm:px-6">
      <WarningIcon aria-hidden="true" weight="regular" className="size-8 text-critical" />

      <div className="flex flex-col gap-3">
        <h1 className="text-h1 text-ink">That page did not load</h1>
        <p className="text-lead text-muted">
          Something failed on our side, not yours. Try again - if it keeps happening, the
          rest of the app still works.
        </p>
        {error.digest ? (
          <p className="numeric text-caption text-faint">Reference: {error.digest}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" size="md" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="secondary" size="md">
          <Link href="/">Go to the home page</Link>
        </Button>
      </div>
    </div>
  );
}
