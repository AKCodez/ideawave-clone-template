import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations use a direct (unpooled) connection when one is available; the
    // app runtime always uses the pooled DATABASE_URL through the Neon adapter.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
