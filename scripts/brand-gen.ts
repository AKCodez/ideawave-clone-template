#!/usr/bin/env tsx
/**
 * Turns `src/brand.ts` into the two generated files the app imports:
 *
 *   src/app/brand.generated.css   the @theme block and both scheme blocks
 *   src/design/fonts.generated.ts the three next/font/google loaders
 *
 * Both are committed. `npm run design:check` runs this with `--check`, so a
 * hand-edited generated file or a brand change nobody regenerated fails verify
 * instead of shipping a page whose CSS and brand disagree.
 *
 *   npm run brand:gen            write the files
 *   npm run brand:gen -- --check exit 1 if they are stale
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import brand from "../src/brand";
import { validateBrand } from "../src/design/brand-schema";
import { COLOR_TOKENS } from "../src/design/color";
import { FONT_LOADERS, FONT_VARIABLES } from "../src/design/fonts";
import { TYPE_TOKENS, buildTokens, tokenContrastFailures, type Tokens } from "../src/design/tokens";
import { FONT_META, SCHEMES, type Brand, type Scheme } from "../src/design/types";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const CSS_PATH = join(root, "src", "app", "brand.generated.css");
const FONTS_PATH = join(root, "src", "design", "fonts.generated.ts");

const BANNER = (file: string, brandValue: Brand): string =>
  [
    `GENERATED FILE - do not edit ${file} by hand.`,
    `Written by scripts/brand-gen.ts from src/brand.ts.`,
    `Brand: ${brandValue.name} - ${brandValue.direction} / ${brandValue.scheme} - accent hue ${brandValue.palette.accentHue}.`,
    `Change src/brand.ts and run \`npm run brand:gen\`.`,
  ].join("\n   ");

function schemeBlock(tokens: Tokens, scheme: Scheme): string {
  const s = tokens.schemes[scheme];
  const lines = [
    `  color-scheme: ${scheme};`,
    ...COLOR_TOKENS.map((token) => `  --color-${token}: ${s.colors[token]};`),
    `  --shadow-tint-weak: ${s.shadowTints.weak};`,
    `  --shadow-tint: ${s.shadowTints.base};`,
    `  --shadow-tint-strong: ${s.shadowTints.strong};`,
    `  --shadow-glow-tint: ${s.shadowTints.glow};`,
  ];
  return `html[data-scheme="${scheme}"] {\n${lines.join("\n")}\n}`;
}

function renderCss(tokens: Tokens): string {
  const { brand: b, motion, type, radius, shadows, stroke, rhythm, containers, fonts } = tokens;
  const active = tokens.schemes[b.scheme];

  const theme: string[] = [
    "  /* Tailwind's own palette, fonts, radii and shadows are removed on purpose:",
    "     a token is the only way to name a colour here, so `text-white`,",
    "     `bg-zinc-900` and `shadow-lg` compile to nothing at all. */",
    "  --color-*: initial;",
    "  --font-*: initial;",
    "  --radius-*: initial;",
    "  --shadow-*: initial;",
    "  --inset-shadow-*: initial;",
    "  --drop-shadow-*: initial;",
    "",
    `  /* Colours of the brand's own scheme (${b.scheme}), so an unset`,
    "     data-scheme attribute still renders the right thing. */",
    ...COLOR_TOKENS.map((token) => `  --color-${token}: ${active.colors[token]};`),
    "",
    "  /* Faces. The loaders live in src/design/fonts.generated.ts. */",
    `  --font-display: ${fonts.stacks.display};`,
    `  --font-body: ${fonts.stacks.body};`,
    `  --font-mono: ${fonts.stacks.mono};`,
    "",
    "  /* Type scale: every size is fluid and carries its own leading,",
    "     tracking and weight, so `text-h2` is the whole decision. */",
  ];

  for (const token of TYPE_TOKENS) {
    const step = type[token];
    theme.push(`  --text-${token}: ${step.size};`);
    theme.push(`  --text-${token}--line-height: ${step.leading};`);
    theme.push(`  --text-${token}--letter-spacing: ${step.tracking};`);
    theme.push(`  --text-${token}--font-weight: ${step.weight};`);
  }

  theme.push(
    "",
    "  /* Radius ramp. The brutal direction sets every step to 0. */",
    ...(["sm", "md", "lg", "xl", "2xl", "input"] as const).map((key) => `  --radius-${key}: ${radius[key]};`),
    "",
    "  /* Borders. */",
    `  --stroke: ${stroke.base};`,
    `  --stroke-strong: ${stroke.strong};`,
    "",
    "  /* Elevation. The tints are scheme-dependent and set below. */",
    ...(["1", "2", "3", "4"] as const).map((key) => `  --shadow-${key}: ${shadows[key]};`),
    `  --shadow-hard: ${shadows.hard};`,
    `  --shadow-glow: ${shadows.glow};`,
    "",
    "  /* Rhythm and measure. */",
    `  --spacing-section: ${rhythm.section};`,
    `  --spacing-block: ${rhythm.block};`,
    `  --container-prose: ${containers.prose};`,
    `  --container-content: ${containers.content};`,
    `  --container-wide: ${containers.wide};`,
    "",
    `  /* Motion. Durations already carry durationScale ${b.motion.durationScale};`,
    `     distances carry the ${b.motion.intensity} intensity. */`,
    ...motion.durations.map((ms, index) => `  --duration-${index + 1}: ${ms}ms;`),
    ...(Object.keys(motion.easings) as (keyof typeof motion.easings)[]).map(
      (key) => `  --ease-${key}: ${motion.easings[key]};`,
    ),
    `  --motion-distance: ${motion.distance}px;`,
    `  --motion-lift: ${motion.lift}px;`,
    `  --motion-tilt: ${motion.tilt}deg;`,
    `  --motion-marquee: ${motion.marquee}px;`,
    `  --motion-duration: var(--duration-4);`,
    `  --motion-ease: var(--ease-${motion.reveal});`,
  );

  const aliases = [
    "/* Plain aliases for raw var() use where a utility would be noise. */",
    ":root {",
    "  --space-section: var(--spacing-section);",
    "  --space-block: var(--spacing-block);",
    "}",
  ].join("\n");

  return [
    `/* ${BANNER("src/app/brand.generated.css", b)} */`,
    "",
    "@theme {",
    theme.join("\n"),
    "}",
    "",
    ...SCHEMES.map((scheme) => schemeBlock(tokens, scheme)),
    "",
    aliases,
    "",
  ].join("\n");
}

function renderFonts(tokens: Tokens): string {
  const { keys } = tokens.fonts;
  const slots = [
    { slot: "display", key: keys.display, constant: "displayFont", preload: true },
    { slot: "body", key: keys.body, constant: "bodyFont", preload: true },
    { slot: "mono", key: keys.mono, constant: "monoFont", preload: false },
  ] as const;

  const importNames = [...new Set(slots.map((s) => FONT_LOADERS[s.key].importName))].sort();

  const blocks = slots.map(({ slot, key, constant, preload }) => {
    const loader = FONT_LOADERS[key];
    const options = [
      `  subsets: ["latin"],`,
      ...(loader.weights ? [`  weight: [${loader.weights.map((w) => `"${w}"`).join(", ")}],`] : []),
      `  variable: "${FONT_VARIABLES[slot]}",`,
      `  display: "swap",`,
      `  preload: ${preload},`,
    ].join("\n");
    return [
      `/** ${slot}: ${FONT_META[key].family} (${key}).${preload ? "" : " Not preloaded: numbers only."} */`,
      `export const ${constant} = ${loader.importName}({`,
      options,
      `});`,
    ].join("\n");
  });

  return [
    `/* ${BANNER("src/design/fonts.generated.ts", tokens.brand)} */`,
    `import { ${importNames.join(", ")} } from "next/font/google";`,
    "",
    ...blocks.flatMap((block) => [block, ""]),
    "/** Every face's CSS variable, for the <html> className. */",
    "export const fontVariables: string = [displayFont.variable, bodyFont.variable, monoFont.variable].join(\" \");",
    "",
  ].join("\n");
}

function readIfPresent(path: string): string | null {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

const normalize = (text: string): string => text.replace(/\r\n/g, "\n");

function main(): void {
  const check = process.argv.includes("--check");

  const validated = validateBrand(brand);
  if (!validated.ok) {
    console.error("src/brand.ts does not satisfy the kit contract:");
    for (const issue of validated.issues) console.error(`  - ${issue.path}: ${issue.message}`);
    process.exit(1);
  }

  const tokens = buildTokens(validated.brand);

  const failures = tokenContrastFailures(tokens);
  if (failures.length > 0) {
    console.error("Contrast floors are not met, so these tokens would ship unreadable text:");
    for (const failure of failures) console.error(`  - ${failure}`);
    console.error("Raise accentChroma, move accentHue, or switch scheme in src/brand.ts.");
    process.exit(1);
  }

  const files: { path: string; label: string; contents: string }[] = [
    { path: CSS_PATH, label: "src/app/brand.generated.css", contents: renderCss(tokens) },
    { path: FONTS_PATH, label: "src/design/fonts.generated.ts", contents: renderFonts(tokens) },
  ];

  if (check) {
    const stale = files.filter((file) => normalize(readIfPresent(file.path) ?? "") !== normalize(file.contents));
    if (stale.length > 0) {
      console.error("Generated files are stale. Run `npm run brand:gen` and commit the result:");
      for (const file of stale) console.error(`  - ${file.label}`);
      process.exit(1);
    }
    const dark = tokens.schemes.dark.contrast;
    const light = tokens.schemes.light.contrast;
    console.log(
      `brand:gen --check ok - ${tokens.brand.name}, ${tokens.brand.direction}/${tokens.brand.scheme}, ` +
        `ink/canvas ${dark.inkOnCanvas}:1 dark and ${light.inkOnCanvas}:1 light`,
    );
    return;
  }

  for (const file of files) {
    mkdirSync(dirname(file.path), { recursive: true });
    writeFileSync(file.path, file.contents, "utf8");
    console.log(`wrote ${file.label}`);
  }

  const { dark, light } = { dark: tokens.schemes.dark.contrast, light: tokens.schemes.light.contrast };
  console.log(
    `${tokens.brand.name}: ${tokens.brand.direction}/${tokens.brand.scheme}, ` +
      `accent hue ${tokens.brand.palette.accentHue}, ` +
      `contrast dark ink ${dark.inkOnCanvas}:1 muted ${dark.mutedOnSurface}:1 accent ${dark.accentOnCanvas}:1, ` +
      `light ink ${light.inkOnCanvas}:1 muted ${light.mutedOnSurface}:1 accent ${light.accentOnCanvas}:1`,
  );
}

main();
