import type { ReactElement } from "react";
import { clsx } from "clsx";
import { Stagger, StaggerItem } from "@/components/motion";
import type { Step } from "@/content/marketing";
import { tokens } from "@/design/tokens";
import { Section, SectionHeader } from "./section";

/**
 * Steps: a numbered process that is actually connected.
 *
 * A line runs between the numbers - vertically under each number on a phone,
 * horizontally from one number to the next at lg - drawn with a border on a
 * token-coloured element. It is never an image and never a background gradient,
 * so it costs nothing and follows the scheme.
 *
 * Direction behaviour it carries: the rule is a hairline everywhere except
 * brutal, which draws it at `--stroke-strong` in `line-strong`, the same weight
 * that direction rules everything else with.
 *
 * Above five steps the horizontal layout would squeeze each column past
 * reading width, so the list stays vertical and the connector stays vertical
 * with it.
 */

const direction = tokens.direction.key;


/** Most steps a row can hold at lg before a column stops being readable. */
const MAX_IN_A_ROW = 5;

/** Full class strings, never built by concatenation, so Tailwind can see them. */
const CONNECTOR_VERTICAL =
  direction === "brutal"
    ? "border-l-(length:--stroke-strong) border-line-strong"
    : "border-l-(length:--stroke) border-line";

const CONNECTOR_HORIZONTAL =
  direction === "brutal"
    ? "lg:border-l-0 lg:border-t-(length:--stroke-strong) lg:border-line-strong"
    : "lg:border-l-0 lg:border-t-(length:--stroke) lg:border-line";

/**
 * The rule between two numbers. Geometry, in one place: the chip is 2.5rem, so
 * its centre sits at 1.25rem (`left-5` / `lg:top-5`), the vertical rule starts
 * 0.5rem under it (`top-12`) and runs a whole list gap past the bottom of the
 * item, and the horizontal one starts 0.75rem after the chip and runs a whole
 * column gap past its right edge.
 */
function StepConnector({ horizontal }: { horizontal: boolean }): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "absolute top-12 bottom-[calc(var(--space-stack)*-1)] left-5",
        CONNECTOR_VERTICAL,
        horizontal && "lg:top-5 lg:right-[-1.5rem] lg:bottom-auto lg:left-[3.25rem]",
        horizontal && CONNECTOR_HORIZONTAL,
      )}
    />
  );
}

export type StepsProps = {
  steps: readonly Step[];
  eyebrow?: string;
  /** Omit to render the list with no header at all. */
  title?: string;
  description?: string;
  id?: string;
};

export function Steps({ steps, eyebrow, title, description, id }: StepsProps): ReactElement {
  const horizontal = steps.length <= MAX_IN_A_ROW;
  const last = steps.length - 1;

  return (
    <Section id={id}>
      {title ? <SectionHeader eyebrow={eyebrow} title={title} description={description} /> : null}

      {/* StaggerItem is imported by name: a server component may not dot into a
          client module, so `Stagger.Item` would throw on property access. */}
      <Stagger
        as="ol"
        className={clsx(
          "grid gap-stack",
          horizontal && "lg:grid-flow-col lg:auto-cols-fr lg:gap-6",
          title && "mt-stack",
        )}
      >
        {steps.map((step, index) => (
          <StaggerItem
            key={step.title}
            as="li"
            className="relative flex gap-4 lg:flex-col lg:gap-5"
          >
            {index < last ? <StepConnector horizontal={horizontal} /> : null}

            <span className="numeric inline-flex size-10 shrink-0 items-center justify-center rounded-md border-(length:--stroke) border-accent/40 bg-accent-soft text-body text-ink">
              {index + 1}
            </span>

            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="text-h3 text-ink">{step.title}</h3>
              <p className="text-small text-muted">{step.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
