import type { ReactElement } from "react";
import { clsx } from "clsx";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";
import type { Faq as FaqItem } from "@/content/marketing";
import { Section, SectionHeader } from "./section";

/**
 * Faq: native `<details>` and `<summary>`, one per question, and not one line
 * of JavaScript. It opens, closes, keyboard-navigates and prints without
 * hydrating anything, and a browser's own find-in-page can open an answer.
 *
 * The chevron rotates on open - a transform, nothing else - and the global
 * reduced-motion block in `motion.css` removes that movement rather than
 * shortening it. The focus ring is the app's one `:focus-visible` treatment,
 * which a `<summary>` gets for free; nothing here restyles it.
 *
 * Direction behaviour it carries: all four, through `card-interactive` on the
 * summary. Editorial draws an accent rule under the open question, luminous
 * lifts it into its glow, brutal shifts it onto a hard shadow and back on
 * press, craft lifts it like a page.
 */

export type FaqProps = {
  items: readonly FaqItem[];
  eyebrow?: string;
  /** Omit to render the questions with no header at all. */
  title?: string;
  description?: string;
  id?: string;
};

export function Faq({ items, eyebrow, title, description, id }: FaqProps): ReactElement {
  return (
    <Section id={id}>
      {title ? <SectionHeader eyebrow={eyebrow} title={title} description={description} /> : null}

      <div
        className={clsx(
          "border-t-(length:--stroke) border-line",
          title && "mt-stack",
        )}
      >
        {items.map((item) => (
          <details key={item.question} className="group border-b-(length:--stroke) border-line">
            <summary className="card-interactive flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
              <h3 className="min-w-0 text-h3 text-ink">{item.question}</h3>
              <CaretDownIcon
                aria-hidden="true"
                weight="bold"
                className="size-5 shrink-0 text-accent transition-transform duration-(--duration-2) ease-out-soft group-open:rotate-180"
              />
            </summary>

            <p className="prose-measure pb-6 text-body text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
