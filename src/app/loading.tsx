import type { ReactElement } from "react";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

/**
 * The generic page skeleton: a headline, a paragraph, a row of panels. A
 * spinner tells you nothing; this tells you what is about to be there.
 */
export default function Loading(): ReactElement {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto w-full max-w-content px-4 py-section sm:px-6"
    >
      <span className="sr-only">Loading</span>

      <Skeleton className="h-12 w-3/4 max-w-lg" />
      <SkeletonText lines={3} className="mt-6 max-w-prose" />

      <div className="mt-block grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((panel) => (
          <div
            key={panel}
            className="rounded-lg border-(length:--stroke) border-line bg-surface p-6"
          >
            <Skeleton className="h-5 w-2/3" />
            <SkeletonText lines={2} className="mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
