import type { MetadataRoute } from "next";
import { tokens } from "@/design/tokens";
import { appName } from "@/lib/env";

/** Home-screen name, kept short enough that Android does not clip it. */
function shortName(value: string): string {
  return value.length <= 12 ? value : `${value.slice(0, 11).trimEnd()}.`;
}

/**
 * Installable-app metadata. The colours are the brand's own scheme, so the
 * splash screen and the browser chrome match the page rather than flashing
 * white on the way in.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: shortName(appName),
    description: tokens.brand.tagline,
    start_url: "/",
    display: "standalone",
    theme_color: tokens.active.hex.canvas,
    background_color: tokens.active.hex.canvas,
    icons: [{ src: "/icon", sizes: "32x32", type: "image/png" }],
  };
}
