import type { ReactElement } from "react";
import Link from "next/link";
import { AuroraMesh, Magnetic, Reveal, SplitText, TiltCard } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tokens } from "@/design/tokens";
import { Section } from "./section";
import type { HeroProps } from "./hero";

/**
 * Luminous: a keynote.
 *
 * Centred, lit from behind, and the product arrives on a tilted pane below the
 * fold line rather than beside the words. The aurora is the only decoration and
 * it is aria-hidden; everything else is type.
 */
export function HeroLuminous({
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
    <Section as="header" width="full" reveal={false} className="relative overflow-hidden">
      <AuroraMesh />

      <div className="relative mx-auto w-full max-w-wide px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          {eyebrow ? <Badge tone="accent">{eyebrow}</Badge> : null}

          <SplitText
            as="h1"
            by="word"
            text={headline}
            className="block max-w-[18ch] text-display text-ink"
          />

          <Reveal delay={step}>
            <p className="max-w-prose text-lead text-muted">{sub}</p>
          </Reveal>

          <Reveal delay={step * 2}>
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Magnetic>
                  <Button asChild variant="primary" size="xl">
                    <Link href={primary.href}>{primary.label}</Link>
                  </Button>
                </Magnetic>
                {secondary ? (
                  <Button asChild variant="secondary" size="xl">
                    <Link href={secondary.href}>{secondary.label}</Link>
                  </Button>
                ) : null}
              </div>
              {note ? <p className="max-w-prose text-small text-faint">{note}</p> : null}
            </div>
          </Reveal>
        </div>

        {frame ? (
          <Reveal delay={step * 3} className="mt-stack block min-w-0">
            <TiltCard>{frame}</TiltCard>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
