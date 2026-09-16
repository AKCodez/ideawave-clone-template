import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/env";

/** Everything public is crawlable, and the sitemap says what "everything" is. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", appUrl).toString(),
    host: appUrl,
  };
}
