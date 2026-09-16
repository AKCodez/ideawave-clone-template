import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The generated Prisma client and its Neon driver adapter must stay external
  // to the bundler so the driver resolves correctly on Vercel Fluid Compute.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-neon"],
  outputFileTracingIncludes: {
    "/**/*": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
