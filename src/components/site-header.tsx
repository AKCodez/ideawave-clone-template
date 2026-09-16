import type { ReactElement } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { NavLinks, NavSheet, type NavItem } from "@/components/nav-sheet";
import { Button } from "@/components/ui/button";
import { navRoutes } from "@/content/routes";

/**
 * Deliberately session-free, so the landing and compare pages stay static.
 * Signed-in state lives behind the app shell, which is dynamic anyway.
 *
 * The narrow-screen menu is the Dialog primitive in its sheet variant. It is a
 * native <dialog> in the top layer, which is the only reason the luminous
 * direction can put a backdrop blur on this header without clipping it.
 */
/* One line per public page lives in src/content/routes.ts, which the sitemap
   reads too, so a new page cannot appear in one and be missing from the other. */
const LINKS: readonly NavItem[] = navRoutes
  .filter((route) => route.path !== "/" && route.path !== "/sign-in" && route.path !== "/sign-up")
  .map((route) => ({ href: route.path, label: route.label }));

export function SiteHeader(): ReactElement {
  return (
    <header className="site-header sticky top-0 z-30 bg-canvas">
      <div className="mx-auto flex h-16 w-full max-w-wide items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="no-underline">
          <Wordmark size="md" />
        </Link>

        <div className="flex items-center gap-2">
          <NavLinks items={LINKS} className="hidden md:flex" />

          <Button asChild variant="secondary" size="sm" className="hidden md:inline-flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>

          <div className="md:hidden">
            <NavSheet items={LINKS} title="Menu">
              <Button asChild variant="primary" size="md" className="w-full">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </NavSheet>
          </div>
        </div>
      </div>
    </header>
  );
}
