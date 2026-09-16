import type { ReactElement, ReactNode } from "react";
import { clsx } from "clsx";
import { Reveal } from "@/components/motion";

/**
 * The wrapper every section is built on.
 *
 * It owns two things no section may decide for itself: the vertical rhythm
 * between sections, and the entrance. Both come from the brand's direction, so
 * a page composed of ten sections has one rhythm rather than ten opinions.
 *
 * A section is a server component. Only the motion primitives inside it are
 * client components, so composing a page costs no client JavaScript by itself.
 */

export type SectionSpace = "section" | "tight" | "none";
export type SectionWidth = "prose" | "content" | "wide" | "full";
export type SectionTone = "canvas" | "surface" | "accent";

export type SectionProps = {
  children: ReactNode;
  /** Anchor target, so a nav or an FAQ link can jump here. */
  id?: string;
  /** Vertical rhythm. `tight` is half a section, for two related blocks. */
  space?: SectionSpace;
  /** How wide the content may get. `full` opts out of the container entirely. */
  width?: SectionWidth;
  /** Background. `accent` is the band tone, used sparingly - once per page. */
  tone?: SectionTone;
  /** Set false when the section animates its own parts, like a hero. */
  reveal?: boolean;
  /** A rule above the section. Editorial and brutal use it; the others rarely do. */
  divided?: boolean;
  as?: "section" | "div" | "footer" | "header" | "article";
  className?: string;
  /** Classes for the inner container, for a grid or a custom layout. */
  innerClassName?: string;
};

/* `--spacing-section` is the space BETWEEN two sections, so each one takes half
   of it above and below. Using the whole token on both sides doubles up at every
   boundary and the page reads as a set of unrelated pages. */
const spaces: Record<SectionSpace, string> = {
  section: "py-[calc(var(--spacing-section)/2)]",
  tight: "py-[calc(var(--spacing-stack)/2)]",
  none: "",
};

const widths: Record<SectionWidth, string> = {
  prose: "mx-auto w-full max-w-prose px-4 sm:px-6",
  content: "mx-auto w-full max-w-content px-4 sm:px-6",
  wide: "mx-auto w-full max-w-wide px-4 sm:px-6",
  full: "w-full",
};

const tones: Record<SectionTone, string> = {
  canvas: "bg-canvas",
  surface: "bg-surface",
  accent: "bg-accent-soft",
};

export function Section({
  children,
  id,
  space = "section",
  width = "content",
  tone = "canvas",
  reveal = true,
  divided = false,
  as: Tag = "section",
  className,
  innerClassName,
}: SectionProps): ReactElement {
  const inner = <div className={clsx(widths[width], innerClassName)}>{children}</div>;

  return (
    <Tag
      id={id}
      className={clsx(
        spaces[space],
        tones[tone],
        divided && "border-t-(length:--stroke) border-line",
        className,
      )}
    >
      {reveal ? <Reveal>{inner}</Reveal> : inner}
    </Tag>
  );
}

export type SectionHeaderProps = {
  /** Small label above the title. Uppercase on editorial and brutal by token. */
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  /** h2 by default; a page with no h1 above it should pass "h1". */
  as?: "h1" | "h2" | "h3";
  className?: string;
};

/** Eyebrow, title and one sentence. Every section that needs a heading uses it. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "start",
  as: Tag = "h2",
  className,
}: SectionHeaderProps): ReactElement {
  return (
    <div
      className={clsx(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow ? <p className="text-caption text-accent">{eyebrow}</p> : null}
      <Tag className={clsx(Tag === "h1" ? "text-h1" : "text-h2", "text-ink")}>{title}</Tag>
      {description ? (
        <p className={clsx("text-lead text-muted", align === "center" ? "max-w-prose" : "max-w-prose")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
