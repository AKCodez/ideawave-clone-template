import type { CSSProperties, ReactElement } from "react";
import { clsx } from "clsx";
import brand from "@/brand";
import type { MonogramShape } from "@/design/types";

/**
 * The mark: one or two letters in the brand's shape, accent behind them and
 * on-accent ink in front, which is the one colour pair with a guaranteed
 * contrast ratio. Everything scales from the pixel size, so it reads at 24px in
 * a header and at 96px on a brand panel.
 */
const NAMED_SIZES = { sm: 24, md: 40, lg: 64, xl: 96 } as const;
export type MonogramSize = keyof typeof NAMED_SIZES | number;

const HEXAGON = "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)";

function shapeStyle(shape: MonogramShape, px: number): CSSProperties {
  if (shape === "circle") return { borderRadius: "50%" };
  if (shape === "square") return { borderRadius: 0 };
  if (shape === "hexagon") return { borderRadius: 0, clipPath: HEXAGON };
  return { borderRadius: Math.round(px * 0.22) };
}

export type MonogramProps = {
  /** A named step or a pixel size. */
  size?: MonogramSize;
  className?: string;
};

export function Monogram({ size = "md", className }: MonogramProps): ReactElement {
  const px = typeof size === "number" ? size : NAMED_SIZES[size];
  const letters = brand.wordmark.monogram.letters.slice(0, 2);

  const style: CSSProperties = {
    width: px,
    height: px,
    fontSize: Math.round(px * (letters.length > 1 ? 0.38 : 0.5)),
    fontWeight: brand.wordmark.weight,
    letterSpacing: letters.length > 1 ? "-0.03em" : "0em",
    lineHeight: 1,
    ...shapeStyle(brand.wordmark.monogram.shape, px),
  };

  return (
    <span
      role="img"
      aria-label={brand.name}
      style={style}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center",
        "bg-accent font-display text-on-accent select-none",
        className,
      )}
    >
      <span aria-hidden="true">{letters.toUpperCase()}</span>
    </span>
  );
}
