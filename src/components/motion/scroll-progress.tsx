/**
 * ScrollProgress: the hairline at the top of the page that fills as you read.
 *
 * Direction behaviour it carries: its thickness is twice the direction's strong
 * stroke, so editorial draws 4px, luminous 3px and brutal a 6px slab, and its
 * colour is the brand accent.
 *
 * It is driven by a `scroll()` timeline in `src/app/motion.css`, so it costs no
 * JavaScript and no scroll listener. Where scroll timelines are unsupported the
 * bar is removed rather than left sitting at a dishonest 100%. It is purely
 * decorative: presentational role, hidden from assistive technology, and it
 * never takes a pointer event.
 */

import type { ReactElement } from "react";

export type ScrollProgressProps = { className?: string };

export function ScrollProgress({ className }: ScrollProgressProps): ReactElement {
  return <div role="presentation" aria-hidden="true" data-scroll-progress="" className={className} />;
}
