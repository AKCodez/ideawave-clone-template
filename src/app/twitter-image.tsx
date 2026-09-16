import { ImageResponse } from "next/og";
import { ogCard } from "@/design/og-layouts";
import { OG_SIZE, loadOgFonts } from "@/design/og";
import { tokens } from "@/design/tokens";
import { appName } from "@/lib/env";

/**
 * The same card as `opengraph-image.tsx`. X reads `twitter:image` and ignores
 * `og:image` when both are present, so this route exists to stop the summary
 * card falling back to a screenshot.
 */
export const alt = `${appName} - ${tokens.brand.tagline}`;
export const size = { width: OG_SIZE.width, height: OG_SIZE.height };
export const contentType = "image/png";

export default function TwitterImage(): ImageResponse {
  const fonts = loadOgFonts();

  return new ImageResponse(
    ogCard({
      name: appName,
      tagline: tokens.brand.tagline,
      displayFamily: fonts.displayFamily,
      textFamily: fonts.textFamily,
    }),
    {
      width: size.width,
      height: size.height,
      ...(fonts.faces ? { fonts: fonts.faces } : {}),
    },
  );
}
