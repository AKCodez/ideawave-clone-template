import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** Unit tests only: pure modules, no DOM, no database. `npm test` runs them once. */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.mjs"],
    exclude: ["node_modules/**", ".next/**", "src/generated/**"],
    environment: "node",
  },
});
