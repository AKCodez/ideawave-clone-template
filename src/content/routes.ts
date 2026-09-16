/**
 * Every public URL this product has, in one list.
 *
 * `src/app/sitemap.ts` builds the sitemap from it and the header and footer
 * build their nav from `navRoutes`, so a page that is not listed here is a page
 * Google never hears about and nobody can click to.
 *
 * ADDING A PAGE: add exactly one line below when you add a public route. Keep
 * the list in reading order - it is also the order the nav renders in.
 * Signed-in routes (`/dashboard`, `/settings`, anything under `(app)`) do NOT
 * belong here: they need a session, so a crawler would only ever see a redirect.
 *
 * The paths are URLs, not file paths. Route groups like `(marketing)` and
 * `(auth)` never appear in a URL, so moving a page between groups does not
 * change anything in this file.
 */

/** Same union `MetadataRoute.Sitemap` uses, spelled out so this file stays framework-free. */
export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type PublicRoute = {
  /** Absolute path, always starting with a slash and never ending with one. */
  path: string;
  /** What a link to it says. */
  label: string;
  /** 0 to 1, relative to the other routes here. The landing page is the 1. */
  priority: number;
  changeFrequency: ChangeFrequency;
  /** True when the primary nav should link it. */
  inNav: boolean;
};

export const publicRoutes: readonly PublicRoute[] = [
  { path: "/", label: "Home", priority: 1, changeFrequency: "weekly", inNav: false },
  { path: "/compare", label: "Compare", priority: 0.8, changeFrequency: "weekly", inNav: true },
  { path: "/premium", label: "Pricing", priority: 0.8, changeFrequency: "monthly", inNav: true },
  { path: "/sign-in", label: "Sign in", priority: 0.3, changeFrequency: "yearly", inNav: false },
  { path: "/sign-up", label: "Create account", priority: 0.5, changeFrequency: "yearly", inNav: false },
] as const;

/**
 * The routes the header and footer link. Auth routes are deliberately out: the
 * header renders its own sign-in button, and the footer its own create-account
 * link, because those two are calls to action rather than navigation.
 */
export const navRoutes: readonly PublicRoute[] = publicRoutes.filter((route) => route.inNav);

/** The one route with a given path, or undefined. Handy for a breadcrumb label. */
export function findRoute(path: string): PublicRoute | undefined {
  return publicRoutes.find((route) => route.path === path);
}
