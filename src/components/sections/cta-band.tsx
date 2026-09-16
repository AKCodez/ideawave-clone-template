import type { ReactElement } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { AuroraMesh } from "@/components/motion";
import { buttonClasses } from "@/components/ui/button";
import { tokens } from "@/design/tokens";
import { cn } from "@/lib/utils";
import { Section } from "./section";

/**
 * CtaBand: the one full-bleed band on a page, and the one place the accent
 * tone is allowed to take over.
 *
 * Direction behaviour it carries:
 *   editorial - a plain band, ruled top and bottom. No light, no paper, no lift.
 *   luminous  - the accent mesh drifts behind the words.
 *   brutal    - a solid accent block with `on-accent` ink and, since every
 *               radius token is 0 in that direction, no corners at all.
 *   craft     - the words sit on a soft paper block lifted off the band.
 *
 * Readability in both schemes comes from the token contract rather than from
 * taste: `accent-soft` is a background token, so `ink` and `muted` are
 * guaranteed against it, and on the solid accent block the only ink used is
 * `on-accent`, which is guaranteed against `accent`. That is also why the
 * buttons change variant there: a primary button is `accent` on `accent`.
 */

const direction = tokens.direction.key;

/** Only the poster direction floods the band with solid accent. */
const SOLID = direction === "brutal";

const BAND = clsx("relative isolate overflow-hidden py-[calc(var(--spacing-section)/2)]", SOLID && "bg-accent");

/** Craft sets the words on paper; the others sit straight on the band. */
const PANEL =
  direction === "craft"
    ? "rounded-2xl border-(length:--stroke) border-line bg-surface p-8 shadow-2 sm:p-10"
    : "";

const TITLE_INK = SOLID ? "text-on-accent" : "text-ink";
const BODY_INK = SOLID ? "text-on-accent" : "text-muted";

/**
 * On the solid accent block the primary action becomes the elevated button,
 * because `accent` on `accent` is not a button. `cn` rather than `clsx` here:
 * the ghost variant ships `text-muted`, and only tailwind-merge can take it
 * back out.
 */
const PRIMARY_CLASS = buttonClasses(SOLID ? "secondary" : "primary", "lg");

const SECONDARY_CLASS = SOLID
  ? cn(
      buttonClasses("ghost", "lg"),
      "text-on-accent hover:bg-on-accent/10 hover:text-on-accent",
    )
  : buttonClasses("secondary", "lg");

export type CtaBandProps = {
  title: string;
  body?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  id?: string;
};

export function CtaBand({ title, body, primary, secondary, id }: CtaBandProps): ReactElement {
  return (
    <Section
      id={id}
      tone="accent"
      width="full"
      space="none"
      divided={direction === "editorial"}
      className={clsx(direction === "editorial" && "border-b-(length:--stroke) border-line")}
    >
      <div className={BAND}>
        {direction === "luminous" ? <AuroraMesh /> : null}

        <div className="relative mx-auto w-full max-w-content px-4 sm:px-6">
          <div className={PANEL}>
            <h2 className={clsx("text-h1", TITLE_INK)}>{title}</h2>

            {body ? <p className={clsx("mt-4 max-w-prose text-lead", BODY_INK)}>{body}</p> : null}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={primary.href} className={PRIMARY_CLASS}>
                {primary.label}
              </Link>

              {secondary ? (
                <Link href={secondary.href} className={SECONDARY_CLASS}>
                  {secondary.label}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
