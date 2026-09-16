import { ImageResponse } from "next/og";
import { ogCard } from "@/design/og-layouts";
import { OG_SIZE, loadOgFonts } from "@/design/og";
import { tokens } from "@/design/tokens";
import { appName } from "@/lib/env";

/**
 * The card every share of this product renders. One layout per art direction,
 * drawn from the same tokens as the site itself (see src/design/og-layouts.tsx).
 */
export const alt = `${appName} - ${tokens.brand.tagline}`;
export const size = { width: OG_SIZE.width, height: OG_SIZE.height };
export const contentType = "image/png";

export default function OpengraphImage(): ImageResponse {
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
