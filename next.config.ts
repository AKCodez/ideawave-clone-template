import type { NextConfig } from "next";

/** The vendored latin TTFs that src/design/og.ts reads with readFileSync. */
const OG_FONTS = "./src/design/og-fonts/*.ttf";

const nextConfig: NextConfig = {
  // The generated Prisma client and its Neon driver adapter must stay external
  // to the bundler so the driver resolves correctly on Vercel Fluid Compute.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-neon"],
  outputFileTracingIncludes: {
    "/**/*": ["./src/generated/prisma/**/*"],
    // Tracing follows imports, and a font read at runtime from a path built
    // off process.cwd() is not an import. Without these three lines the OG
    // card still renders - it just renders in the wrong typeface.
    "/icon": [OG_FONTS],
    "/opengraph-image": [OG_FONTS],
    "/twitter-image": [OG_FONTS],
  },
};

export default nextConfig;
