import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

const links = [
  { href: "/compare", label: "Compare" },
  { href: "/premium", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

/**
 * Deliberately session-free so the landing and compare pages stay static.
 * Signed-in state lives on /dashboard, which is dynamic anyway.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-display text-lg text-ink">
          Clone Template
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-input px-2 py-1.5 text-sm text-muted transition-colors hover:text-ink sm:px-3"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/sign-in" className={buttonClasses("secondary", "sm", "ml-1")}>
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}
