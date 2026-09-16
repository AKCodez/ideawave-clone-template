import type { ReactElement } from "react";
import {
  Bento,
  CtaBand,
  Faq,
  Hero,
  ProductFrame,
  Section,
  SectionHeader,
  Stats,
  Steps,
} from "@/components/sections";
import { SnippetList } from "@/components/snippet-list";
import { WaitlistForm } from "@/components/waitlist-form";
import { demoSnippetsWithDates } from "@/content/demo";
import { benefits, ctaBand, faqs, frame, hero, stats, steps } from "@/content/marketing";

/**
 * The landing page, composed from the kit.
 *
 * The shape to keep when you replace the copy: a Hero with the product really
 * running inside it, then at least four more sections. Everything below the
 * hero answers one question each - what it does, how it works, what is true
 * about it, what people ask, and what to do next.
 *
 * Every word comes from src/content/marketing.ts. Every row in the frame is the
 * same seeded data a new account gets, from src/content/demo.ts.
 */
export default function HomePage(): ReactElement {
  const rows = demoSnippetsWithDates()
    .slice(0, 5)
    .map((snippet, index) => ({ ...snippet, id: `demo-${index}` }));

  return (
    <>
      <Hero
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        sub={hero.sub}
        primary={hero.primaryCta}
        secondary={hero.secondaryCta}
        note={hero.note}
        frame={
          <ProductFrame label={`${frame.eyebrow} - live`}>
            <SnippetList snippets={rows} density="compact" />
          </ProductFrame>
        }
      />

      <Bento
        id="what"
        items={benefits}
        eyebrow="What is already built"
        title="The parts nobody enjoys building"
        description="Wired, verified, and yours to change. None of it is a dependency you have to wait on."
      />

      <Steps
        id="how"
        steps={steps}
        eyebrow="How a build goes"
        title="Four steps, in this order"
        description="Each one ends with something you can open in a browser."
      />

      <Stats stats={stats} title="Counted, not claimed" />

      <Section id="waitlist" tone="surface" width="content">
        <div className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="Stay in touch"
            title="Get told when something changes"
            description="One short email when a version ships. No newsletter, no drip sequence."
          />
          <WaitlistForm />
        </div>
      </Section>

      <Faq id="faq" items={faqs} eyebrow="Questions" title="Before you start" />

      <CtaBand
        title={ctaBand.title}
        body={ctaBand.body}
        primary={ctaBand.primary}
        secondary={ctaBand.secondary}
      />
    </>
  );
}
