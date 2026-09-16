"use client";

import { useState, type MouseEvent, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { ListIcon } from "@phosphor-icons/react/dist/ssr";
import { Dialog } from "@/components/ui/dialog";

/**
 * Navigation shared by both shells: the marketing header and the app sidebar.
 * The narrow-screen menu is the Dialog primitive in its sheet variant, so it
 * gets the native top layer, Escape, the focus trap and focus return for free.
 */
export type NavItem = {
  href: string;
  label: string;
  /** Optional leading icon element, passed in from a server component. */
  icon?: ReactNode;
};

export type NavLinksProps = {
  items: readonly NavItem[];
  orientation?: "row" | "column";
  className?: string;
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function NavLinks({
  items,
  orientation = "row",
  className,
}: NavLinksProps): ReactElement {
  const pathname = usePathname();

  return (
    <nav
      className={clsx(
        "flex gap-1",
        orientation === "column" ? "flex-col" : "flex-row items-center",
        className,
      )}
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "btn btn-ghost inline-flex min-h-10 items-center gap-2 rounded-input px-3 py-2 text-small font-medium no-underline",
              orientation === "column" && "justify-start",
              active ? "bg-surface text-ink" : "text-muted hover:bg-surface hover:text-ink",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export type NavSheetProps = {
  items: readonly NavItem[];
  /** Names the sheet for screen readers. */
  title: string;
  /** Anything that belongs under the links: a call to action, the user block. */
  children?: ReactNode;
  className?: string;
};

export function NavSheet({ items, title, children, className }: NavSheetProps): ReactElement {
  const [open, setOpen] = useState(false);

  function closeOnLink(event: MouseEvent<HTMLDivElement>): void {
    if (event.target instanceof HTMLElement && event.target.closest("a")) setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={title}
        aria-expanded={open}
        className="btn btn-secondary inline-flex size-10 items-center justify-center rounded-input border-(length:--stroke) border-line bg-elevated text-ink hover:border-line-strong"
      >
        <ListIcon aria-hidden="true" weight="bold" className="size-5" />
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title={title} variant="sheet">
        <div onClick={closeOnLink} className={clsx("flex h-full flex-col gap-6", className)}>
          <NavLinks items={items} orientation="column" />
          {children}
        </div>
      </Dialog>
    </>
  );
}
