import type { ReactElement } from "react";
import Link from "next/link";
import brand from "@/brand";
import { Marquee, Reveal, SplitText } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { tokens } from "@/design/tokens";
import { Section } from "./section";
import type { HeroProps } from "./hero";

/**
 * Brutal: a printed poster.
 *
 * Flush left, no radius, heavy rules top and bottom, and a ticker of the
 * brand's own phrases running between the headline and the product. The kicker
 * is a solid accent block rather than a pill.
 */
export function HeroBrutal({
  eyebrow,
  headline,
  sub,
  primary,
  secondary,
  note,
  frame,
}: HeroProps): ReactElement {
  const step = tokens.motion.durations[1];

  return (
    <Section as="header" width="full" space="none" reveal={false}>
      <div className="mx-auto w-full max-w-wide px-4 pt-[calc(var(--spacing-section)/2)] pb-stack sm:px-6">
        {eyebrow ? (
          <p className="inline-block bg-accent px-2 py-1 text-caption text-on-accent">{eyebrow}</p>
        ) : null}
        <SplitText as="h1" by="word" text={headline} className="mt-6 block text-display text-ink" />
      </div>

      <Marquee className="border-y-(length:--stroke-strong) border-line-strong bg-surface py-3">
        {brand.voice.phrases.map((phrase) => (
          <span key={phrase} className="px-6 text-caption text-muted">
            {phrase}
          </span>
        ))}
      </Marquee>

      <div className="mx-auto grid w-full max-w-wide gap-stack px-4 py-stack sm:px-6 lg:grid-cols-2 lg:items-start">
        <Reveal delay={step} className="flex flex-col gap-6">
          <p className="max-w-prose text-lead text-ink">{sub}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href={primary.href}>{primary.label}</Link>
            </Button>
            {secondary ? (
              <Button asChild variant="outline" size="lg">
                <Link href={secondary.href}>{secondary.label}</Link>
              </Button>
            ) : null}
          </div>
          {note ? <p className="max-w-prose text-small text-muted">{note}</p> : null}
        </Reveal>

        {frame ? (
          <Reveal delay={step * 2} className="min-w-0">
            {frame}
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
