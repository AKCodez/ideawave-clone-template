import type { CSSProperties, ReactElement } from "react";
import { clsx } from "clsx";

/**
 * Initials by default, a picture when there is one. No next/image: this
 * template ships no `images` config, so a plain <img> is the honest choice and
 * the lint rule is disabled on that one line.
 */
const NAMED_SIZES = { sm: 24, md: 32, lg: 48, xl: 64 } as const;
export type AvatarSize = keyof typeof NAMED_SIZES | number;

/** Up to two initials from a name, or from the local part of an email. */
export function initialsFrom(name: string): string {
  const source = name.includes("@") ? name.slice(0, name.indexOf("@")) : name;
  const words = source
    .replace(/[^\p{L}\p{N}\s._-]/gu, " ")
    .split(/[\s._-]+/u)
    .filter(Boolean);
  const letters = words.slice(0, 2).map((word) => word.charAt(0));
  const joined = letters.join("").toUpperCase();
  return joined || "?";
}

export type AvatarProps = {
  /** The person's name, or their email when that is all there is. */
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
};

export function Avatar({ name, src, size = "md", className }: AvatarProps): ReactElement {
  const px = typeof size === "number" ? size : NAMED_SIZES[size];
  const style: CSSProperties = {
    width: px,
    height: px,
    fontSize: Math.round(px * 0.4),
  };

  return (
    <span
      style={style}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "border-(length:--stroke) border-line bg-accent-soft font-medium text-ink select-none",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={px} height={px} className="size-full object-cover" />
      ) : (
        <span aria-hidden="true">{initialsFrom(name)}</span>
      )}
    </span>
  );
}
