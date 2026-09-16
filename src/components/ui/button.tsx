import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement } from "react";
import { clsx } from "clsx";

/**
 * The one button.
 *
 * Colour lives in the utilities below; the hover and press *behaviour* lives in
 * `src/app/components.css`, keyed on the direction, which is why every button
 * carries the bare `btn` class plus its `btn-<variant>` class. A variant that
 * forgets those two classes has no press state, so never build one by hand.
 *
 * `clsx`, not `cn`: tailwind-merge groups `text-small` and `text-muted` into one
 * class group and would silently drop the type step. See the note in the report.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "link" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const base =
  "btn inline-flex shrink-0 items-center justify-center gap-2 rounded-input font-medium " +
  "no-underline disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "btn-primary bg-accent text-on-accent hover:bg-accent-hover",
  secondary:
    "btn-secondary border-(length:--stroke) border-line bg-elevated text-ink hover:border-line-strong",
  ghost: "btn-ghost text-muted hover:bg-surface hover:text-ink",
  outline:
    "btn-outline border-(length:--stroke-strong) border-line-strong text-ink hover:bg-surface",
  link: "btn-link text-accent hover:text-accent-hover",
  danger:
    "btn-danger border-(length:--stroke) border-critical/40 bg-critical/10 text-critical hover:border-critical hover:bg-critical/20",
};

/** Box sizes. The link variant is type, not a box, so it takes only the step. */
const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-small",
  md: "h-10 px-4 text-small",
  lg: "h-12 px-5 text-body",
  xl: "h-14 px-7 text-lead",
};

/* A link variant is type rather than a box, but it is still something a thumb
   has to hit: the min-height keeps every one of them at or above WCAG 2.5.8's
   24px without padding it into looking like a button. */
const linkSizes: Record<ButtonSize, string> = {
  sm: "min-h-6 text-small",
  md: "min-h-7 text-small",
  lg: "min-h-8 text-body",
  xl: "min-h-9 text-lead",
};

/** Class string for anything that should look like a button, links included. */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return clsx(
    base,
    variants[variant],
    variant === "link" ? linkSizes[size] : sizes[size],
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, sets aria-busy, and disables the button. */
  loading?: boolean;
  /**
   * Render the single child element with the button classes merged instead of a
   * `<button>`, so a `<Link>` can be a button without nesting interactive
   * elements. Only `className` is merged; give the child its own href and props.
   */
  asChild?: boolean;
};

type ClassNameProps = { className?: string };

export function Button({
  variant = "primary",
  size = "md",
  className,
  loading = false,
  asChild = false,
  disabled,
  children,
  type = "button",
  ...rest
}: ButtonProps): ReactElement | null {
  const classes = buttonClasses(variant, size, className);

  if (asChild) {
    if (!isValidElement<ClassNameProps>(children)) return null;
    return cloneElement(children, {
      className: clsx(classes, children.props.className),
    });
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="btn-spinner size-4 shrink-0 rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  );
}
