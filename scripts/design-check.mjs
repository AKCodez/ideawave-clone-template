#!/usr/bin/env tsx
/**
 * The design and completeness gate. `npm run design:check`, and part of verify.
 *
 * Six categories, each with its own exit code so a caller can tell what broke
 * without parsing output:
 *
 *   2  forbidden strings, raw colours and banned animation patterns
 *   3  landing composition
 *   4  renames (the template's own identity must be gone)
 *   5  generated files in sync with src/brand.ts
 *   6  the feature bar (real models, real demo data, real empty states)
 *   7  asset routes present
 *   0  clean
 *
 * When several categories fail the lowest code is returned, and every finding
 * is still printed.
 *
 * Inside a Clone Studio build the tree is held to the finished-product bar.
 * Outside one, the rules only a generated product can satisfy are reported as
 * warnings rather than failures, so the template passes its own check while
 * still showing how far it is from the bar.
 *
 * A build is detected by `.clone/SPEC.md` existing, since the sandbox runs the
 * template's plain `npm run verify` and passes no flags. `--build` forces the
 * same mode by hand.
 *
 * `--json` prints the findings as JSON for the audit.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* Build mode is detected, not requested. IdeaWave writes .clone/SPEC.md into
   the checkout before the agent starts, and the sandbox then runs the
   template's plain `npm run verify`, so no flag ever reaches this script there.
   The file is what says "this is a build". --build forces the same mode by
   hand, for checking a tree locally. */
const SPEC_PATH = join(root, ".clone", "SPEC.md");
const BUILD_REASON = process.argv.includes("--build")
  ? "--build"
  : existsSync(SPEC_PATH)
    ? ".clone/SPEC.md"
    : null;
const BUILD = BUILD_REASON !== null;
const JSON_OUT = process.argv.includes("--json");

const findings = [];

/**
 * @param {number} category
 * @param {string} rule
 * @param {string} file
 * @param {number} line
 * @param {string} message
 * @param {{productBar?: boolean}} [opts] productBar rules only fail under --build.
 */
function report(category, rule, file, line, message, opts = {}) {
  const fatal = opts.productBar ? BUILD : true;
  findings.push({ category, rule, file: file.split(sep).join("/"), line, message, fatal });
}

/* ------------------------------ file access ------------------------------ */

const SOURCE_EXT = /\.(ts|tsx|mts|css)$/;

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "generated" || entry.name === "node_modules") continue;
      out.push(...walk(full));
    } else if (SOURCE_EXT.test(entry.name) && !entry.name.includes(".generated.")) {
      out.push(full);
    }
  }
  return out;
}

const rel = (abs) => relative(root, abs).split(sep).join("/");
const read = (abs) => readFileSync(abs, "utf8");
const lines = (text) => text.split(/\r?\n/);

const srcFiles = walk(join(root, "src"));
const within = (abs, ...dirs) => dirs.some((d) => rel(abs).startsWith(d));

const isComment = (content) => /^\s*(?:\/\/|\/\*|\*)/.test(content);

/** Tests assert on the very literals the design rules ban, so they are not UI. */
const isTest = (file) => /\.test\.(ts|tsx)$/.test(file);

/**
 * Scan files line by line for a pattern.
 * @param {string[]} files
 * @param {RegExp} pattern
 * @param {(file: string, line: number, match: RegExpExecArray) => void} onHit
 * @param {{skip?: (file: string) => boolean, code?: boolean}} [opts]
 *   `code` skips comment lines and test files, for rules about shipped UI.
 */
function scan(files, pattern, onHit, opts = {}) {
  for (const abs of files) {
    const name = rel(abs);
    if (opts.skip?.(name)) continue;
    if (opts.code && isTest(name)) continue;
    lines(read(abs)).forEach((content, i) => {
      if (opts.code && isComment(content)) return;
      const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
      let match;
      while ((match = re.exec(content)) !== null) {
        onHit(name, i + 1, match);
        if (match.index === re.lastIndex) re.lastIndex += 1;
      }
    });
  }
}

const pkgPath = join(root, "package.json");
const readmePath = join(root, "README.md");
const pkg = JSON.parse(read(pkgPath));

/* --------------------- 2: forbidden strings and classes ------------------- */

/* The template's own identity. Legitimate here, never in a build. */
for (const pattern of [/Clone Kit/g, /Clone Template/g, /ideawave clone template/gi]) {
  scan([...srcFiles, pkgPath, readmePath], pattern, (file, line, match) => {
    report(2, "template-name", file, line, `"${match[0]}" is the template's name, not this product's`, {
      productBar: true,
    });
  });
}

scan([readmePath], /localhost/g, (file, line) => {
  report(2, "readme-localhost", file, line, "README points at localhost", { productBar: true });
});

/* The demo address may be written once, at its definition, and nowhere else. */
const DEMO_ADDRESS_ALLOWED = ["src/design/types.ts", "src/components/demo-banner.tsx"];
scan(
  srcFiles,
  /demo@example\.com/g,
  (file, line) => {
    report(2, "demo-address", file, line, "the demo address belongs in the DEMO_LOGIN constant");
  },
  { skip: (file) => DEMO_ADDRESS_ALLOWED.includes(file) },
);

/* Raw colour. The pattern needs three hex digits straight after the hash, so it
   cannot match inside a `[0-9a-f]` character class; the two token-derived files
   are exempt by path as a second guard. */
const COLOR_EXEMPT = ["src/design/og-layouts.tsx", "src/design/color.ts"];
const componentFiles = srcFiles.filter(
  (abs) => within(abs, "src/components", "src/app", "src/design") && !abs.endsWith(".css"),
);

scan(
  componentFiles,
  /#[0-9a-fA-F]{3,8}\b/g,
  (file, line, match) => {
    report(2, "raw-colour", file, line, `${match[0]} is a raw colour, use a token`);
  },
  { skip: (file) => COLOR_EXEMPT.includes(file), code: true },
);

scan(
  srcFiles,
  /\b(?:text-white|bg-black|text-black)\b/g,
  (file, line, match) => {
    report(2, "raw-colour", file, line, `${match[0]} is a raw colour, use a token`);
  },
  { code: true },
);

const PALETTE =
  /-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d+/g;
scan(
  srcFiles,
  PALETTE,
  (file, line, match) => {
    report(2, "palette-utility", file, line, `${match[0]} is a Tailwind palette colour, use a token`);
  },
  { code: true },
);

scan(
  srcFiles,
  /style=\{\{[^}]*\b(?:color|background)\b[^}]*#[0-9a-fA-F]{3,8}/g,
  (file, line) => {
    report(2, "inline-colour", file, line, "inline style sets a hex colour");
  },
  { code: true },
);

/* `layout` drives a paint-heavy relayout; tabs.tsx is the one place it earns it. */
scan(
  srcFiles,
  /<m\.[a-zA-Z]+(?:\s[^>]*?)?\slayout(?:\s|=|>|\/)/g,
  (file, line) => {
    report(2, "layout-prop", file, line, "layout on a motion component outside tabs.tsx");
  },
  { skip: (file) => file === "src/components/ui/tabs.tsx", code: true },
);

/* Only an ANIMATED filter. A static filter is fine, and a comment that merely
   mentions one is not a violation at all. */
const FILTER_IN_MOTION =
  /\b(?:animate|initial|exit|whileHover|whileTap|whileInView|whileFocus|variants)\s*=?\s*\{\{[^}]*\bfilter\s*:/g;
const FILTER_IN_TRANSITION = /transition(?:-property)?\s*:[^;]*\bfilter\b/g;

for (const pattern of [FILTER_IN_MOTION, FILTER_IN_TRANSITION]) {
  scan(
    srcFiles,
    pattern,
    (file, line) => {
      report(2, "filter-animation", file, line, "animating filter, which cannot run on the compositor");
    },
    { code: true },
  );
}

scan(
  srcFiles,
  /\bsetInterval\b/g,
  (file, line) => {
    report(2, "set-interval", file, line, "setInterval drives animation, use rAF or a transition");
  },
  { skip: (file) => !file.startsWith("src/components"), code: true },
);

scan(
  srcFiles,
  /addEventListener\(\s*["']scroll["']/g,
  (file, line) => {
    report(2, "scroll-listener", file, line, "JS scroll listener, use IntersectionObserver or CSS");
  },
  { code: true },
);

/* -------------------------- 3: landing composition ------------------------ */

const landing = ["src/app/(marketing)/page.tsx", "src/app/page.tsx"]
  .map((p) => join(root, p))
  .find((p) => existsSync(p));

if (!landing) {
  report(3, "landing", "src/app", 0, "no landing page found", { productBar: true });
} else {
  const imported = new Set();
  const re = /import\s*\{([^}]+)\}\s*from\s*["']@\/components\/sections\/[^"']+["']/g;
  let match;
  const text = read(landing);
  while ((match = re.exec(text)) !== null) {
    for (const name of match[1].split(",")) {
      const clean = name.trim().split(/\s+as\s+/)[0].trim();
      if (clean) imported.add(clean);
    }
  }
  const file = rel(landing);
  if (imported.size < 5) {
    report(3, "landing", file, 1, `imports ${imported.size} section components, needs 5`, {
      productBar: true,
    });
  }
  for (const required of ["Hero", "ProductFrame"]) {
    if (!imported.has(required)) {
      report(3, "landing", file, 1, `does not import ${required}`, { productBar: true });
    }
  }
}

/* ------------------------------- 4: renames ------------------------------- */

const brand = (await import("../src/brand.ts")).default;

if (pkg.name === "ideawave-clone-template") {
  report(4, "rename", "package.json", 1, "name is still the template's", { productBar: true });
}

const authPath = join(root, "src/lib/auth.ts");
if (existsSync(authPath)) {
  lines(read(authPath)).forEach((content, i) => {
    if (/appName:\s*["']Clone Template["']/.test(content)) {
      report(4, "rename", "src/lib/auth.ts", i + 1, "appName is hardcoded, read brand.name", {
        productBar: true,
      });
    }
  });
}

const readmeHeading = lines(read(readmePath))
  .find((l) => l.startsWith("# "))
  ?.slice(2)
  .trim();
if (readmeHeading !== brand.name) {
  report(4, "rename", "README.md", 1, `first heading is "${readmeHeading}", expected "${brand.name}"`, {
    productBar: true,
  });
}

/* --------------------- 5: generated files in sync ------------------------- */

const gen = spawnSync("npx", ["tsx", "scripts/brand-gen.ts", "--check"], {
  cwd: root,
  encoding: "utf8",
  shell: process.platform === "win32",
});
if (gen.status !== 0) {
  const detail = `${gen.stderr ?? ""}${gen.stdout ?? ""}`
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const bullets = detail.filter((l) => l.startsWith("- "));
  const messages = bullets.length > 0 ? bullets : [detail[0] ?? "brand-gen --check failed"];
  for (const message of messages) {
    report(5, "generated", "src/brand.ts", 1, message.replace(/^- /, ""));
  }
}

/* ----------------------------- 6: feature bar ----------------------------- */

const SCAFFOLD_MODELS = new Set([
  "User",
  "Session",
  "Account",
  "Verification",
  "Subscription",
  "WaitlistEntry",
]);
const models = [...read(join(root, "prisma/schema.prisma")).matchAll(/^model\s+(\w+)\s*\{/gm)].map(
  (m) => m[1],
);
const featureModels = models.filter((m) => !SCAFFOLD_MODELS.has(m));
if (featureModels.length < 3) {
  report(
    6,
    "feature-bar",
    "prisma/schema.prisma",
    1,
    `${featureModels.length} feature models (${featureModels.join(", ") || "none"}), needs 3`,
    { productBar: true },
  );
}

const demoPath = join(root, "src/content/demo.ts");
if (!existsSync(demoPath)) {
  report(6, "feature-bar", "src/content/demo.ts", 0, "missing", { productBar: true });
} else {
  const demo = await import("../src/content/demo.ts");
  const populated = Object.entries(demo).filter(
    ([key, value]) => key !== "default" && Array.isArray(value) && value.length >= 5,
  );
  if (populated.length < 3) {
    report(
      6,
      "feature-bar",
      "src/content/demo.ts",
      1,
      `${populated.length} exports with 5 or more rows, needs 3`,
      { productBar: true },
    );
  }
}

for (const abs of srcFiles.filter((f) => within(f, "src/app/(app)") && f.endsWith("page.tsx"))) {
  const text = read(abs);
  if (text.includes("findMany") && !/\bEmptyState\b/.test(text)) {
    report(6, "feature-bar", rel(abs), 1, "reads rows but never imports EmptyState", {
      productBar: true,
    });
  }
}

/* --------------------------- 7: asset routes ------------------------------ */

for (const name of [
  "icon.tsx",
  "opengraph-image.tsx",
  "twitter-image.tsx",
  "manifest.ts",
  "robots.ts",
  "sitemap.ts",
]) {
  const abs = join(root, "src/app", name);
  if (!existsSync(abs) || !statSync(abs).isFile()) {
    report(7, "asset-route", `src/app/${name}`, 0, "missing");
  }
}

/* -------------------------------- output ---------------------------------- */

findings.sort((a, b) => a.category - b.category || a.file.localeCompare(b.file) || a.line - b.line);

const fatal = findings.filter((f) => f.fatal);
const warnings = findings.filter((f) => !f.fatal);
const exitCode = fatal[0]?.category ?? 0;

if (JSON_OUT) {
  console.log(
    JSON.stringify(
      { build: BUILD, buildReason: BUILD_REASON, ok: fatal.length === 0, exitCode, findings },
      null,
      2,
    ),
  );
} else {
  console.log(`design:check${BUILD ? ` - build mode, via ${BUILD_REASON}` : ""}`);
  if (findings.length === 0) {
    console.log("clean - every rule passed");
  } else {
    const columns = [
      { head: "", render: (f) => (f.fatal ? "FAIL" : "warn") },
      { head: "CAT", render: (f) => String(f.category) },
      { head: "WHERE", render: (f) => `${f.file}:${f.line}` },
      { head: "RULE", render: (f) => f.rule },
      { head: "DETAIL", render: (f) => f.message },
    ].map((column) => ({
      ...column,
      width: Math.max(column.head.length, ...findings.map((f) => column.render(f).length)),
    }));
    const line = (cells) => cells.map((cell, i) => cell.padEnd(columns[i].width)).join("  ").trimEnd();
    console.log(line(columns.map((c) => c.head)));
    console.log(line(columns.map((c) => "-".repeat(c.width))));
    for (const finding of findings) console.log(line(columns.map((c) => c.render(finding))));
  }
  if (warnings.length > 0 && !BUILD) {
    console.log(
      `\n${warnings.length} warning(s): rules only a finished build can satisfy. ` +
        "They become failures inside a Clone Studio build, which is detected by " +
        ".clone/SPEC.md existing.",
    );
  }
  console.log(`\n${fatal.length} failure(s), ${warnings.length} warning(s)`);
}

process.exit(exitCode);
