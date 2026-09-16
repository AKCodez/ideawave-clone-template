import { ImageResponse } from "next/og";
import { OgMonogram } from "@/design/og-layouts";
import { ICON_SIZE, loadOgFonts } from "@/design/og";
import { tokens } from "@/design/tokens";

/**
 * The only icon this app ships - there is no favicon.ico. It is the brand's
 * monogram in its own shape, accent behind, `on-accent` letters, so the tab
 * and the share card carry the same mark.
 */
export const size = { width: ICON_SIZE.width, height: ICON_SIZE.height };
export const contentType = "image/png";

export default function Icon(): ImageResponse {
  const fonts = loadOgFonts();
  const hex = tokens.active.hex;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: hex.canvas,
        }}
      >
        <OgMonogram
          size={size.width}
          background={hex.accent}
          color={hex["on-accent"]}
          fontFamily={fonts.displayFamily}
          // A tab renders this at 16px. The mark needs every pixel it can get.
          glyphScale={tokens.brand.wordmark.monogram.letters.length > 1 ? 0.46 : 0.62}
        />
      </div>
    ),
    {
      width: size.width,
      height: size.height,
      ...(fonts.faces ? { fonts: fonts.faces } : {}),
    },
  );
}
