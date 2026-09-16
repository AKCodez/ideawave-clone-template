#!/usr/bin/env node
/**
 * Builds and photographs every art direction, so the kit can be judged rather
 * than described.
 *
 *   node scripts/preview-directions.mjs                 # all six presets
 *   node scripts/preview-directions.mjs brutal craft    # just these
 *
 * For each preset it writes src/brand.ts, regenerates the tokens, builds,
 * starts the production server on PREVIEW_PORT (3100 by default), screenshots
 * four pages at three widths, saves the OG card, runs axe, and records the
 * numbers. Then it restores src/brand.ts and writes preview/summary.md.
 *
 * A build takes about a minute, so all six take roughly ten. Nothing here is
 * part of `npm run verify`: this is the pass a person reviews.
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PREVIEW_PORT ?? 3100);
const BASE = `http://localhost:${PORT}`;
const SHOTS = join(root, "preview", "shots");
const OG_DIR = join(root, "preview", "og");
const PAGES = ["/", "/sign-in", "/compare", "!/not-a-page"];
const WIDTHS = [390, 1024, 1440];

const ALL_PRESETS = ["editorial", "luminous", "brutal", "craft", "editorial-light", "luminous-light"];
const presets = process.argv.slice(2).filter((arg) => ALL_PRESETS.includes(arg));
const targets = presets.length > 0 ? presets : ALL_PRESETS;

const run = (command, args, options = {}) =>
  spawnSync(command, args, { cwd: root, shell: true, encoding: "utf8", ...options });

function fail(message) {
  console.error(message);
  run("npx", ["tsx", "scripts/brand-set.ts", "--restore"]);
  process.exit(1);
}

async function waitForServer(timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE, { headers: { accept: "text/html" } });
      if (response.status < 500) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

/** The facts the summary reports, read out of the generated CSS. */
function readTokens() {
  const css = readFileSync(join(root, "src", "app", "brand.generated.css"), "utf8");
  const value = (name) => new RegExp(`--${name}:\\s*([^;]+);`).exec(css)?.[1]?.trim() ?? "";
  const brand = readFileSync(join(root, "src", "brand.ts"), "utf8");
  const field = (name) => new RegExp(`"${name}":\\s*"([^"]+)"`).exec(brand)?.[1] ?? "";
  const number = (name) => new RegExp(`"${name}":\\s*([0-9.]+)`).exec(brand)?.[1] ?? "";
  return {
    name: field("name"),
    tagline: field("tagline"),
    direction: field("direction"),
    scheme: field("scheme"),
    display: field("display"),
    body: field("body"),
    accentHue: number("accentHue"),
    intensity: field("intensity"),
    accent: value("color-accent"),
    canvas: value("color-canvas"),
    radius: value("radius-lg"),
    stroke: value("stroke"),
    duration: value("duration-4"),
    ease: value("motion-ease"),
  };
}

async function axeAndOg(label) {
  const { AxeBuilder } = await import("@axe-core/playwright");
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const violations = [];

  for (const path of ["/", "/sign-in"]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    for (const violation of results.violations) {
      if (violation.impact === "serious" || violation.impact === "critical") {
        violations.push(`${path}: ${violation.id} (${violation.impact}) x${violation.nodes.length}`);
      }
    }
  }

  const response = await context.request.get(`${BASE}/opengraph-image`);
  const buffer = await response.body();
  mkdirSync(OG_DIR, { recursive: true });
  writeFileSync(join(OG_DIR, `${label}.png`), buffer);
  const og = {
    status: response.status(),
    type: response.headers()["content-type"] ?? "",
    bytes: buffer.length,
  };

  await context.close();
  await browser.close();
  return { violations, og };
}

async function previewOne(preset) {
  console.log(`\n=== ${preset} ===`);

  const set = run("npx", ["tsx", "scripts/brand-set.ts", preset], { stdio: "inherit" });
  if (set.status !== 0) fail(`could not set the brand to ${preset}`);

  const build = run("npm", ["run", "build"], { stdio: "inherit" });
  if (build.status !== 0) fail(`${preset} did not build`);

  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: root,
    shell: true,
    stdio: "ignore",
    detached: false,
  });

  try {
    if (!(await waitForServer())) fail(`${preset} server never answered on ${BASE}`);

    const shot = run("node", ["scripts/shoot.mjs"], {
      stdio: "inherit",
      env: {
        ...process.env,
        BASE,
        TAG: preset,
        OUT: "preview/shots",
        PAGES: JSON.stringify(PAGES.map((p) => p.replace(/^!/, ""))),
        WIDTHS: JSON.stringify(WIDTHS),
      },
    });

    const { violations, og } = await axeAndOg(preset);
    const tokens = readTokens();

    return {
      preset,
      tokens,
      shotsOk: shot.status === 0,
      violations,
      og,
      shots: WIDTHS.flatMap((width) =>
        PAGES.map((path) => {
          const clean = path.replace(/^!/, "");
          const name = clean === "/" ? "home" : clean.replace(/^\//, "").replace(/\//g, "-");
          return `preview/shots/${preset}-${name}-${width}.png`;
        }),
      ),
    };
  } finally {
    server.kill();
    /* next start spawns through a shell on Windows, so the child can outlive
       the shell. Free the port explicitly before the next preset builds. */
    if (process.platform === "win32") {
      run("powershell", [
        "-NoProfile",
        "-Command",
        `Get-NetTCPConnection -LocalPort ${PORT} -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }`,
      ]);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

function writeSummary(results) {
  const lines = [
    "# The four directions",
    "",
    "Built by `node scripts/preview-directions.mjs`. Every number below is read",
    "out of the generated tokens, and every screenshot is of a production build.",
    "",
    "| Preset | Direction | Scheme | Display | Accent | Radius | Stroke | Reveal | OG | axe |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...results.map((r) => {
      const t = r.tokens;
      const og = r.og.status === 200 && r.og.type.startsWith("image/") ? `${Math.round(r.og.bytes / 1024)} KB` : "FAILED";
      const axe = r.violations.length === 0 ? "clean" : `${r.violations.length} serious`;
      return `| ${r.preset} | ${t.direction} | ${t.scheme} | ${t.display} | ${t.accent} | ${t.radius} | ${t.stroke} | ${t.duration} ${t.ease} | ${og} | ${axe} |`;
    }),
    "",
  ];

  for (const result of results) {
    const t = result.tokens;
    lines.push(
      `## ${result.preset}`,
      "",
      `**${t.name}** - ${t.tagline}`,
      "",
      `- Direction ${t.direction}, scheme ${t.scheme}, accent hue ${t.accentHue}, motion ${t.intensity}.`,
      `- Display ${t.display} over ${t.body}. Canvas ${t.canvas}, accent ${t.accent}.`,
      `- Corners ${t.radius}, rules ${t.stroke}, entrance ${t.duration} on ${t.ease}.`,
      `- OG card: ${result.og.status} ${result.og.type}, ${Math.round(result.og.bytes / 1024)} KB - \`preview/og/${result.preset}.png\`.`,
      result.violations.length === 0
        ? "- axe: no serious or critical violations on / or /sign-in."
        : `- axe: ${result.violations.join("; ")}`,
      result.shotsOk ? "" : "- One or more pages reported overflow or an element that never appeared.",
      "",
      "Screenshots:",
      "",
      ...result.shots.map((file) => `- \`${file}\``),
      "",
    );
  }

  lines.push(
    "## What to look for",
    "",
    "- The first ten seconds at 1440 and at 390. Is there a product on the screen?",
    "- Can the four directions be told apart in three seconds?",
    "- Hover every button and press it. Tab through the page.",
    "- Turn reduced motion on: movement should be gone, not merely faster.",
    "- Read the OG card at thumbnail size. Does the name survive?",
    "- Zero template strings. No `Clone Kit`, no `localhost`, no lorem.",
    "",
  );

  mkdirSync(join(root, "preview"), { recursive: true });
  writeFileSync(join(root, "preview", "summary.md"), lines.join("\n"), "utf8");
  console.log(`\nwrote preview/summary.md`);
}

async function main() {
  mkdirSync(SHOTS, { recursive: true });
  const results = [];
  for (const preset of targets) results.push(await previewOne(preset));

  run("npx", ["tsx", "scripts/brand-set.ts", "--restore"], { stdio: "inherit" });
  run("npm", ["run", "brand:gen"], { stdio: "inherit" });

  writeSummary(results);

  const broken = results.filter((r) => r.violations.length > 0 || r.og.status !== 200 || !r.shotsOk);
  for (const result of broken) {
    console.error(`${result.preset}: axe ${result.violations.length}, og ${result.og.status}, shots ${result.shotsOk ? "ok" : "problems"}`);
  }
  process.exit(broken.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(String(error));
  run("npx", ["tsx", "scripts/brand-set.ts", "--restore"]);
  process.exit(1);
});
