import type { ReactElement } from "react";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

/** The shape of the dashboard, drawn before its rows arrive. */
export default function DashboardLoading(): ReactElement {
  return (
    <div className="flex flex-col gap-block" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your dashboard</span>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b-(length:--stroke) border-line pb-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="rounded-lg border-(length:--stroke) border-line bg-surface p-6">
        <Skeleton className="h-5 w-40" />
        <div className="mt-5 flex flex-col gap-3">
          <Skeleton className="h-10 w-full rounded-input" />
          <Skeleton className="h-24 w-full rounded-input" />
          <Skeleton className="h-10 w-36 rounded-input" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-36" />
        <div className="overflow-hidden rounded-lg border-(length:--stroke) border-line">
          <div className="border-b-(length:--stroke) border-line bg-surface px-4 py-3">
            <SkeletonText lines={1} />
          </div>
          {[0, 1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between gap-4 border-b-(length:--stroke) border-line px-4 py-3 last:border-b-0"
            >
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
