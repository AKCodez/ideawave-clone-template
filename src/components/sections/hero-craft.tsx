import type { ReactElement } from "react";
import Link from "next/link";
import brand from "@/brand";
import { Reveal, TiltCard } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { tokens } from "@/design/tokens";
import { Section } from "./section";
import type { HeroProps } from "./hero";

/**
 * Craft: the opening page of a well-made book.
 *
 * Two columns, generous leading, and a headline that is read rather than
 * announced: no split animation, one calm fade. The first phrase of the brand's
 * voice sits under the rule with a drawn underline, which is the direction's
 * one flourish.
 */
export function HeroCraft({
  eyebrow,
  headline,
  sub,
  primary,
  secondary,
  note,
  frame,
}: HeroProps): ReactElement {
  const step = tokens.motion.durations[1];
  const phrase = brand.voice.phrases[0];

  return (
    <Section as="header" width="full" reveal={false}>
      <div className="mx-auto grid w-full max-w-wide gap-stack px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-6">
          {eyebrow ? (
            <p className="border-b-(length:--stroke) border-line pb-3 text-caption text-accent">
              {eyebrow}
            </p>
          ) : null}

          <Reveal>
            <h1 className="max-w-[16ch] text-display text-ink">{headline}</h1>
          </Reveal>

          <Reveal delay={step}>
            <p className="max-w-prose text-lead text-muted">{sub}</p>
          </Reveal>

          <Reveal delay={step * 2}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="primary" size="lg">
                  <Link href={primary.href}>{primary.label}</Link>
                </Button>
                {secondary ? (
                  <Button asChild variant="secondary" size="lg">
                    <Link href={secondary.href}>{secondary.label}</Link>
                  </Button>
                ) : null}
              </div>
              {note ? <p className="max-w-prose text-small text-faint">{note}</p> : null}
              {phrase ? (
                <p className="text-small text-muted">
                  <span data-underline="" className="relative">
                    {phrase}
                  </span>
                </p>
              ) : null}
            </div>
          </Reveal>
        </div>

        {frame ? (
          <Reveal delay={step * 3} className="min-w-0">
            <TiltCard>{frame}</TiltCard>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
