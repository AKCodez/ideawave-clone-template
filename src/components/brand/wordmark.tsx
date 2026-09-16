import type { CSSProperties, ElementType, ReactElement } from "react";
import { clsx } from "clsx";
import brand from "@/brand";
import type { WordmarkTracking } from "@/design/types";
import { appName } from "@/lib/env";

/**
 * The product's name, set the way the brand says to set it.
 *
 * Case, tracking and weight come from `brand.wordmark` - a logotype is the one
 * piece of type allowed to disagree with the scale, because it is a drawing of
 * a name rather than a line of text.
 */
const TRACKING: Record<WordmarkTracking, string> = {
  tight: "-0.035em",
  normal: "0em",
  wide: "0.1em",
};

const SIZES = {
  sm: "text-body",
  md: "text-h3",
  lg: "text-h2",
} as const;

export type WordmarkSize = keyof typeof SIZES;
export type WordmarkTag = "span" | "div" | "p" | "h1" | "h2" | "h3";

export type WordmarkProps = {
  size?: WordmarkSize;
  /** The element to render. Use h1 exactly once per page, if at all. */
  as?: WordmarkTag;
  className?: string;
};

function cased(value: string): string {
  if (brand.wordmark.case === "lower") return value.toLowerCase();
  if (brand.wordmark.case === "upper") return value.toUpperCase();
  return value;
}

export function Wordmark({ size = "md", as = "span", className }: WordmarkProps): ReactElement {
  const Tag: ElementType = as;
  const style: CSSProperties = {
    letterSpacing: TRACKING[brand.wordmark.tracking],
    fontWeight: brand.wordmark.weight,
  };

  return (
    <Tag
      style={style}
      className={clsx("font-display text-ink whitespace-nowrap", SIZES[size], className)}
    >
      {cased(appName)}
    </Tag>
  );
}
