import type { ReactElement } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import brand from "@/brand";
import { Reveal, TiltCard } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { tokens } from "@/design/tokens";
import { Section } from "./section";
import type { HeroProps } from "./hero";
import { HeroLayout, heroAlign, heroLayout } from "./hero-layout";

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
      <div className="mx-auto w-full max-w-wide px-4 sm:px-6">
        <HeroLayout
          rule="border-line"
          copy={
            <>
              {eyebrow ? (
                <p className={clsx("border-b-(length:--stroke) border-line pb-3 text-caption text-accent", heroLayout === "stage" && "px-6")}>
                  {eyebrow}
                </p>
              ) : null}
              <Reveal>
                <h1 className={clsx("text-display text-ink", heroLayout === "ledger" ? "max-w-[24ch]" : "max-w-[16ch]")}>{headline}</h1>
              </Reveal>
              <Reveal delay={step}>
                <p className="max-w-prose text-lead text-muted">{sub}</p>
              </Reveal>
              <Reveal delay={step * 2}>
                <div className={clsx("flex flex-col gap-4", heroAlign)}>
                  <div className={clsx("flex flex-wrap items-center gap-3", heroLayout === "stage" && "justify-center")}>
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
            </>
          }
          frame={
            frame ? (
              <Reveal delay={step * 3} className="min-w-0">
                <TiltCard>{frame}</TiltCard>
              </Reveal>
            ) : undefined
          }
        />
      </div>
    </Section>
  );
}
