import type { ReactElement, ReactNode } from "react";
import { clsx } from "clsx";
import { Section, SectionHeader } from "./section";
import { tokens } from "@/design/tokens";

/**
 * The chrome the product is shown inside on the marketing pages.
 *
 * This is the single most important component on the landing page: it is where
 * a visitor sees that the thing is real. Put the feature's own component inside
 * it, rendered with seeded demo data, never a screenshot and never a mockup.
 *
 * The chrome differs per direction so the same product reads as a different
 * piece of software: a bare titled window on editorial, a lit glass browser on
 * luminous, a 2px window with a hard shadow on brutal, a paper browser on
 * craft. `phone` exists for a feature that is genuinely mobile-first.
 */

export type ProductFrameChrome = "browser" | "window" | "phone";

const DEFAULT_CHROME: Record<typeof tokens.direction.key, ProductFrameChrome> = {
  editorial: "window",
  luminous: "browser",
  brutal: "window",
  craft: "browser",
};

export type ProductFrameProps = {
  children: ReactNode;
  chrome?: ProductFrameChrome;
  /** Address bar or title bar text. Defaults to the product's own name. */
  label?: string;
  className?: string;
};

function Dots(): ReactElement {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
      <span className="size-2.5 rounded-full bg-line-strong" />
      <span className="size-2.5 rounded-full bg-line-strong" />
      <span className="size-2.5 rounded-full bg-line-strong" />
    </span>
  );
}

/** Just the chrome. Compose it anywhere; `ProductFrameSection` adds the rhythm. */
export function ProductFrame({ children, chrome, label, className }: ProductFrameProps): ReactElement {
  const shape = chrome ?? DEFAULT_CHROME[tokens.direction.key];
  const title = label ?? tokens.brand.name;
  const direction = tokens.direction.key;

  const shell = clsx(
    "relative flex w-full flex-col overflow-hidden border-(length:--stroke) border-line bg-surface",
    shape === "browser" && "rounded-xl",
    shape === "window" && "rounded-sm",
    shape === "phone" && "mx-auto max-w-[24rem] rounded-2xl",
    direction === "luminous" && "shadow-glow",
    direction === "brutal" && "border-(length:--stroke-strong) border-line-strong shadow-hard",
    direction === "craft" && "shadow-3",
    direction === "editorial" && "shadow-2",
    className,
  );

  return (
    <div className={shell}>
      {shape === "phone" ? (
        <div className="flex items-center justify-center border-b-(length:--stroke) border-line bg-elevated py-2">
          <span aria-hidden="true" className="h-1.5 w-16 rounded-full bg-line-strong" />
        </div>
      ) : (
        <div
          className={clsx(
            "flex items-center gap-3 border-b-(length:--stroke) border-line bg-elevated px-3 py-2.5",
            direction === "brutal" && "border-b-(length:--stroke-strong) border-line-strong",
          )}
        >
          {shape === "browser" ? <Dots /> : null}
          <span
            className={clsx(
              "min-w-0 flex-1 truncate text-caption text-muted",
              shape === "browser" &&
                "rounded-full border-(length:--stroke) border-line bg-surface px-3 py-1 text-center",
            )}
          >
            {title}
          </span>
          {shape === "window" ? (
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-line-strong" />
          ) : null}
        </div>
      )}

      {/* The product itself. It scrolls inside the frame, never the page. */}
      <div className="min-w-0 overflow-x-auto p-3 sm:p-4">{children}</div>
    </div>
  );
}

export type ProductFrameSectionProps = ProductFrameProps & {
  eyebrow?: string;
  title?: string;
  description?: string;
  id?: string;
};

/** The frame as a page section, with a heading above it. */
export function ProductFrameSection({
  eyebrow,
  title,
  description,
  id,
  children,
  ...frame
}: ProductFrameSectionProps): ReactElement {
  return (
    <Section id={id} width="wide">
      {title ? (
        <SectionHeader eyebrow={eyebrow} title={title} description={description} className="mb-stack" />
      ) : null}
      <ProductFrame {...frame}>{children}</ProductFrame>
    </Section>
  );
}
