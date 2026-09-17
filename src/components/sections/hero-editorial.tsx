import type { ReactElement } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import brand from "@/brand";
import { Reveal, SplitText } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { tokens } from "@/design/tokens";
import { Section } from "./section";
import type { HeroProps } from "./hero";
import { HeroLayout, heroAlign, heroLayout } from "./hero-layout";

/**
 * Editorial: a magazine cover.
 *
 * A masthead rule, one enormous serif headline set across the full measure, and
 * the standfirst dropped into a narrow column beside the product. The accent
 * appears exactly twice: the kicker and the rule. Nothing is centred.
 */
export function HeroEditorial({
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
    <Section as="header" width="full" reveal={false}>
      <div className="mx-auto w-full max-w-wide px-4 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b-(length:--stroke) border-line pb-4">
          {eyebrow ? <p className="text-caption text-accent">{eyebrow}</p> : null}
          <p className="text-caption text-faint">{brand.voice.adjectives.join(" / ")}</p>
        </div>

        <div className="mt-8">
          <HeroLayout
            rule="border-line"
            copy={
              <>
                <SplitText as="h1" by="word" text={headline} className={clsx("block text-display text-ink", heroLayout === "stage" && "max-w-[18ch]")} />
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
                        <Button asChild variant="link" size="lg">
                          <Link href={secondary.href}>{secondary.label}</Link>
                        </Button>
                      ) : null}
                    </div>
                    {note ? <p className="max-w-prose text-small text-faint">{note}</p> : null}
                  </div>
                </Reveal>
              </>
            }
            frame={
              frame ? (
                <Reveal delay={step * 3} className="min-w-0">
                  {frame}
                </Reveal>
              ) : undefined
            }
          />
        </div>
      </div>
    </Section>
  );
}
