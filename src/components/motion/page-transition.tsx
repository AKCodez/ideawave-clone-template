/**
 * PageTransition: the crossfade between one route and the next.
 *
 * Direction behaviour it carries: the incoming page rises by a fraction of the
 * direction's `--motion-distance` on the direction's own easing, so a brutal
 * navigation snaps and an editorial one glides. The keyframes live in
 * `src/app/motion.css` under the `iw-page` view-transition class.
 *
 * React's <ViewTransition> needs no configuration in the App Router, which
 * serves a React canary that exports it. If it is ever missing (a plain React
 * 19.2 in a unit test, for instance) this renders its children untouched rather
 * than breaking the build.
 */

import * as React from "react";
import type { ReactElement, ReactNode } from "react";

/** Present in the App Router's React; absent from a stock React 19.2. */
const ViewTransition = React.ViewTransition as
  | React.ExoticComponent<React.ViewTransitionProps>
  | undefined;

/** Whether this React exports <ViewTransition>. Read by tests and by the docs. */
export const hasViewTransition: boolean = typeof ViewTransition !== "undefined";

export type PageTransitionProps = { children: ReactNode };

export function PageTransition({ children }: PageTransitionProps): ReactElement {
  if (!ViewTransition) return <>{children}</>;
  return <ViewTransition default="iw-page">{children}</ViewTransition>;
}
