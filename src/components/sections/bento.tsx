import type { ReactElement } from "react";
import { clsx } from "clsx";
import { Spotlight, Stagger, StaggerItem, TiltCard } from "@/components/motion";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Benefit } from "@/content/marketing";
import { tokens } from "@/design/tokens";
import { Section, SectionHeader } from "./section";

/**
 * Bento: the benefit grid, laid out as a real bento rather than three equal
 * boxes. One column on a phone, two at md, three at lg, and a benefit that
 * carries `span: 2` takes two of those three columns, so the grid reads as a
 * composition instead of a row of cards.
 *
 * Direction behaviour it carries:
 *   editorial - a hairline rule and nothing else. No shadow, no lift, no tilt.
 *   luminous  - the cursor lights the panel (Spotlight) and the panel turns
 *               towards it (TiltCard), sitting in its own glow ring.
 *   brutal    - `card-interactive` gives the hard offset shadow on hover and
 *               the press that shifts the cell back onto the page.
 *   craft     - a page-lift shadow and a restrained tilt.
 *
 * `Benefit` carries no icon, so each cell draws the direction's own mark: a
 * rule on editorial, a small accent chip elsewhere. It is decorative, never the
 * only signal.
 */

const direction = tokens.direction.key;

/** Only the keynote direction lights a panel from the cursor. */
const LIT = direction === "luminous";

/** Luminous and craft turn towards the pointer; the other two are flat by design. */
const TILTS = direction === "luminous" || direction === "craft";

/** The poster direction gets its hover and press from `card-interactive`. */
const HARD = direction === "brutal";

/** Resting elevation. Editorial keeps the hairline and nothing else. */
const CARD_CLASS = clsx(
  "h-full",
  direction === "luminous" && "shadow-glow",
  direction === "craft" && "shadow-2",
);


function CellMark(): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "mb-4 block",
        direction === "editorial"
          ? "w-10 border-t-(length:--stroke-strong) border-accent"
          : "size-2.5 rounded-sm bg-accent",
      )}
    />
  );
}

function BentoCell({ item }: { item: Benefit }): ReactElement {
  const card = (
    <Card interactive={HARD} className={CARD_CLASS}>
      <CellMark />
      <CardTitle>{item.title}</CardTitle>
      <CardDescription>{item.body}</CardDescription>
    </Card>
  );

  const tilted = TILTS ? <TiltCard className="h-full">{card}</TiltCard> : card;

  // The glow layer sits behind the card and is not clipped, so on luminous the
  // light spills out from under the panel and follows the cursor.
  return LIT ? <Spotlight className="h-full">{tilted}</Spotlight> : tilted;
}

export type BentoProps = {
  items: readonly Benefit[];
  /** Small label above the title. Ignored when there is no title. */
  eyebrow?: string;
  /** Omit to render the grid with no header at all. */
  title?: string;
  description?: string;
  id?: string;
};

export function Bento({ items, eyebrow, title, description, id }: BentoProps): ReactElement {
  return (
    <Section id={id} width="wide">
      {title ? <SectionHeader eyebrow={eyebrow} title={title} description={description} /> : null}

      {/* The cells arrive one after another, orchestrated by the Stagger root.
          StaggerItem is imported by name because a server component may not dot
          into a client module: `Stagger.Item` throws on property access here. */}
      <Stagger
        as="ul"
        className={clsx(
          "grid grid-cols-1",
          /* The composition's density: dense packs six cards in three columns,
             airy gives four cards two wide columns and more air between them. */
          tokens.brand.composition.bento === "airy" ? "gap-6 md:grid-cols-2 lg:grid-cols-2" : "gap-4 md:grid-cols-2 lg:grid-cols-3",
          title && "mt-stack",
        )}
      >
        {items.map((item, index) => (
          <StaggerItem
            key={item.title}
            as="li"
            className={clsx("min-w-0", item.span === 2 && "lg:col-span-2")}
          >
            <BentoCell item={item} />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
