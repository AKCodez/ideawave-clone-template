import type { ReactElement } from "react";
import Link from "next/link";
import brand from "@/brand";
import { Monogram } from "@/components/brand/monogram";
import { Wordmark } from "@/components/brand/wordmark";
import { publicRoutes } from "@/content/routes";

/* Every public page except the landing page itself, straight from the one list
   the sitemap reads, so the footer can never link to a page that no longer exists. */
const LINKS = publicRoutes
  .filter((route) => route.path !== "/")
  .map((route) => ({ href: route.path, label: route.label }));

/** "Built with IdeaWave Clone Studio", with the minutes when the build knows them. */
function creditLine(): string {
  const minutes = brand.credit.builtInMinutes;
  if (minutes === null) return "Built with IdeaWave Clone Studio";
  return `Built with IdeaWave Clone Studio in ${minutes} minutes`;
}

export function SiteFooter(): ReactElement {
  return (
    <footer className="border-t-(length:--stroke) border-line">
      <div className="mx-auto flex w-full max-w-wide flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Monogram size="sm" />
              <Wordmark size="md" />
            </div>
            <p className="max-w-prose text-small text-muted">{brand.tagline}</p>
          </div>

          <nav className="flex flex-col gap-2 sm:items-end">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-small text-muted no-underline transition-colors duration-(--duration-1) hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="border-t-(length:--stroke) border-line pt-6 text-caption text-faint">
          <a
            href={brand.credit.startupUrl}
            className="text-faint no-underline transition-colors duration-(--duration-1) hover:text-ink"
          >
            {creditLine()}
          </a>
        </p>
      </div>
    </footer>
  );
}
