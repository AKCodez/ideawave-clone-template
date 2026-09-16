import type { MetadataRoute } from "next";
import { publicRoutes } from "@/content/routes";
import { appUrl } from "@/lib/env";

/**
 * Built from `src/content/routes.ts`, so adding a public page is one line there
 * rather than an edit in two files.
 *
 * There is no `lastModified`: a build-time `new Date()` would only ever say
 * "whenever this deployment happened", which is worse than saying nothing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: new URL(route.path, appUrl).toString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
