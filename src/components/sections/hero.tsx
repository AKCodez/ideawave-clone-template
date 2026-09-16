import type { ReactElement, ReactNode } from "react";
import { tokens } from "@/design/tokens";
import { HeroBrutal } from "./hero-brutal";
import { HeroCraft } from "./hero-craft";
import { HeroEditorial } from "./hero-editorial";
import { HeroLuminous } from "./hero-luminous";

/**
 * The first ten seconds.
 *
 * There is one Hero per art direction and they are not variations on a layout:
 * a magazine cover, a keynote, a poster and a book page. Which one renders is
 * decided by `src/brand.ts`, never by a prop, so a build cannot accidentally
 * compose the wrong one.
 *
 * Pass `frame` a ProductFrame wrapping the feature's real component with seeded
 * data. A hero without a live product in it is a template with copy on it.
 */

export type HeroAction = { label: string; href: string };

export type HeroProps = {
  eyebrow?: string;
  headline: string;
  sub: string;
  primary: HeroAction;
  secondary?: HeroAction;
  /** One short line under the buttons. Honest, no exclamation marks. */
  note?: string;
  /** A ProductFrame. Omit it only on a page that is not the landing page. */
  frame?: ReactNode;
};

export function Hero(props: HeroProps): ReactElement {
  switch (tokens.direction.key) {
    case "luminous":
      return <HeroLuminous {...props} />;
    case "brutal":
      return <HeroBrutal {...props} />;
    case "craft":
      return <HeroCraft {...props} />;
    case "editorial":
    default:
      return <HeroEditorial {...props} />;
  }
}
