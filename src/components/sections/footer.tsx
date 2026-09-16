import type { ReactElement } from "react";
import Link from "next/link";
import brand from "@/brand";
import { Monogram } from "@/components/brand/monogram";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonClasses } from "@/components/ui/button";
import { navRoutes } from "@/content/routes";
import { cn } from "@/lib/utils";
import { Section } from "./section";

/**
 * Footer: the mark, the tagline, the nav and the credit.
 *
 * The nav is built from `navRoutes`, the one list the sitemap also reads, so a
 * page that exists is linked and a page that was deleted cannot be linked.
 *
 * Every link carries the kit's `btn` classes, which is where the direction's
 * hover AND press states live - a footer link that only changes colour on
 * hover has half a state.
 */

/** Muted footer links, with the direction's own underline, hover and press. */
const LINK_CLASS = cn(buttonClasses("link", "sm"), "text-muted hover:text-ink");

/** The credit line, without the minutes. */
const CREDIT = "Built with IdeaWave Clone Studio";

/**
 * IdeaWaveBadge: the credit, and a contractual part of this template.
 *
 * It must stay present, visible and readable. The link is DOFOLLOW on purpose -
 * there is no `nofollow` here and there must never be one - and it opens in a
 * new tab with `noopener`. The accent dot is what makes it read as a credit
 * rather than one more nav link.
 */
export function IdeaWaveBadge(): ReactElement {
  const minutes: number | null = brand.credit.builtInMinutes;
  const label =
    typeof minutes === "number"
      ? `${CREDIT} in ${minutes} ${minutes === 1 ? "minute" : "minutes"}`
      : CREDIT;

  return (
    <a
      href={brand.credit.startupUrl}
      target="_blank"
      rel="noopener"
      className={cn(
        buttonClasses("ghost", "sm"),
        "min-h-10 gap-2 px-0 text-caption text-muted hover:bg-transparent hover:text-ink",
      )}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
      {label}
    </a>
  );
}

export function Footer(): ReactElement {
  return (
    <Section
      as="footer"
      width="wide"
      space="tight"
      divided
      reveal={false}
      innerClassName="flex flex-col gap-8"
    >
      <div className="flex flex-col justify-between gap-8 sm:flex-row">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Monogram size="sm" />
            <Wordmark size="md" />
          </div>
          <p className="max-w-prose text-small text-muted">{brand.tagline}</p>
        </div>

        <nav aria-label="Footer" className="flex flex-col items-start gap-2 sm:items-end">
          {navRoutes.map((route) => (
            <Link key={route.path} href={route.path} className={LINK_CLASS}>
              {route.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t-(length:--stroke) border-line pt-6">
        <IdeaWaveBadge />
      </div>
    </Section>
  );
}
