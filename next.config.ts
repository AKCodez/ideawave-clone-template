import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Inlined into every bundle at build time so a statically prerendered page
    // and a dynamic one can never disagree about which palette is active.
    // Changing APP_PALETTE therefore needs a rebuild, not just a restart.
    APP_PALETTE: process.env.APP_PALETTE ?? "ember",
  },
  // The generated Prisma client and its Neon driver adapter must stay external
  // to the bundler so the driver resolves correctly on Vercel Fluid Compute.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-neon"],
  outputFileTracingIncludes: {
    "/**/*": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
