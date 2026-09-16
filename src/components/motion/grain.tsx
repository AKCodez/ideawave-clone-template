/**
 * Grain: the film grain over the whole page.
 *
 * Direction behaviour it carries: none of its own. It is the texture that keeps
 * a large flat canvas from banding, so it belongs to every direction equally.
 *
 * Two rules keep it from becoming dirt: it is near-invisible on the light
 * scheme (opacity 0.018 against 0.055 on dark, set in `src/app/motion.css`),
 * and it never animates anything but transform, jittering in four steps. It is
 * one repeating feTurbulence tile inlined into the stylesheet, so it costs no
 * request, it is aria-hidden, it never takes a pointer event, and being fixed
 * it can never add a pixel of horizontal scroll. Mount it at the top of the
 * tree: a transformed or filtered ancestor would become its containing block
 * and pin the grain to that box instead of the viewport.
 */

import type { ReactElement } from "react";

export type GrainProps = { className?: string };

export function Grain({ className }: GrainProps): ReactElement {
  return <div data-grain="" aria-hidden="true" className={className} />;
}
