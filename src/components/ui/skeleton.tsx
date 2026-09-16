import type { HTMLAttributes, ReactElement } from "react";
import { clsx } from "clsx";

/**
 * A placeholder with the shape of the thing that is coming. The sweep is CSS
 * (`.skeleton` in components.css) and turns into a flat block under
 * prefers-reduced-motion.
 *
 * Skeletons stand in for content that is arriving. For content that will never
 * arrive until someone acts, use EmptyState instead.
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>): ReactElement {
  return (
    <div
      aria-hidden="true"
      className={clsx("skeleton h-4 w-full rounded-sm", className)}
      {...props}
    />
  );
}

export type SkeletonTextProps = HTMLAttributes<HTMLDivElement> & {
  /** How many lines to draw. The last one is short, the way a paragraph ends. */
  lines?: number;
};

export function SkeletonText({
  lines = 3,
  className,
  ...props
}: SkeletonTextProps): ReactElement {
  return (
    <div className={clsx("flex flex-col gap-2", className)} {...props}>
      {Array.from({ length: Math.max(1, lines) }, (_unused, index) => (
        <Skeleton
          key={index}
          className={index === lines - 1 && lines > 1 ? "h-3.5 w-2/5" : "h-3.5 w-full"}
        />
      ))}
    </div>
  );
}
