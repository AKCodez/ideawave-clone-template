#!/usr/bin/env tsx
/**
 * Writes `src/brand.ts` from one of the presets in `src/design/presets.ts`.
 *
 *   npm run brand:set luminous
 *
 * The file it writes is byte-for-byte the shape IdeaWave's `renderBrandTs`
 * emits, so previewing a direction exercises exactly the path a real build
 * takes. Run `npm run brand:gen` afterwards, or just `npm run dev`.
 *
 * `--restore` puts back whatever git has committed, which is how
 * scripts/preview-directions.mjs leaves the tree clean.
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PRESETS, PRESET_KEYS, type PresetKey } from "../src/design/presets";
import type { Brand } from "../src/design/types";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND_PATH = join(root, "src", "brand.ts");

const HEADER = 'import type { Brand } from "@/design/types";\n\nexport const brand = ';
const FOOTER = " as const satisfies Brand;\n\nexport default brand;\n";

/** The exact `src/brand.ts` IdeaWave writes into a build. */
export function renderBrandTs(brand: Brand): string {
  return `${HEADER}${JSON.stringify(brand, null, 2)}${FOOTER}`;
}

function main(): void {
  const [arg] = process.argv.slice(2);

  if (arg === "--restore") {
    const result = spawnSync("git", ["checkout", "--", "src/brand.ts"], { cwd: root, stdio: "inherit" });
    if (result.status !== 0) {
      console.error("could not restore src/brand.ts from git");
      process.exit(1);
    }
    console.log("restored src/brand.ts");
    return;
  }

  if (!arg || !(PRESET_KEYS as string[]).includes(arg)) {
    console.error(`usage: brand:set <${PRESET_KEYS.join(" | ")}> | --restore`);
    process.exit(1);
  }

  const preset = PRESETS[arg as PresetKey];
  writeFileSync(BRAND_PATH, renderBrandTs(preset), "utf8");
  console.log(`src/brand.ts is now ${preset.name}: ${preset.direction} / ${preset.scheme}`);
}

main();
