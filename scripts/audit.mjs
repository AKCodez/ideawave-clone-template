#!/usr/bin/env node
/**
 * The design audit: screenshots plus findings, for the agent to read and fix.
 *
 * Clone Studio runs this inside the sandbox after the build boots, then hands
 * the agent the PNGs and the findings for a polish pass. It is also useful by
 * hand: start the app, then run it.
 *
 *   AUDIT_BASE=http://localhost:3000 \
 *   AUDIT_PAGES='["/","/dashboard"]' \
 *   AUDIT_OUT=.clone/audit \
 *   AUDIT_PASS=1 \
 *   AUDIT_DEMO_EMAIL=demo@example.com AUDIT_DEMO_PASSWORD=demo-pass-1234 \
 *   node scripts/audit.mjs
 *
 * Writes <out>/report.json ({ pass, score, findings, screenshots }) and
 * <out>/report.md, plus one PNG per page per width. Exits 0 even when it finds
 * problems - the report is the output, and a failing audit must never fail a
 * build. Exit 1 means the audit itself could not run.
 *
 * Every page is scrolled twice before it is judged, because sections enter on
 * scroll and a section nested inside one that is still animating is invisible
 * to the observer until its parent finishes.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE = (process.env.AUDIT_BASE ?? "http://localhost:3000").replace(/\/+$/, "");
const OUT = process.env.AUDIT_OUT ?? ".clone/audit";
const PASS = process.env.AUDIT_PASS ?? "1";
const DEMO_EMAIL = process.env.AUDIT_DEMO_EMAIL ?? "";
const DEMO_PASSWORD = process.env.AUDIT_DEMO_PASSWORD ?? "";

/** Pages every audit looks at, unless AUDIT_PAGES says otherwise. */
const PUBLIC_WIDTHS = [390, 1024, 1440];
const SIGNED_IN_WIDTH = 1440;
const MAX_VIEWPORTS = 4;

/* A path written "!/nope" is expected to answer 404, which is how the not-found
   page gets audited without its own 404 counting as a defect. */
function parsePages() {
  const raw = process.env.AUDIT_PAGES;
  if (!raw) return { public: ["/"], signedIn: ["/dashboard"] };
  try {
    const all = JSON.parse(raw);
    if (!Array.isArray(all)) throw new Error("not an array");
    const paths = all
      .filter((p) => typeof p === "string" && (p.startsWith("/") || p.startsWith("!/")))
      .map((p) => p);
    /* Anything behind the shell needs the demo session; everything else is
       shot signed out, because that is what a visitor sees. */
    // Every audited page but the landing page is an app page (the pipeline passes

    // /dashboard and the feature entry paths), so all of them are shot signed in;

    // a prefix rule missed feature routes like /repurpose and shot the sign-in page.

    const signedIn = paths.filter((p) => p !== "/");
    const isPublic = paths.filter((p) => !signedIn.includes(p));
    return { public: isPublic.length > 0 ? isPublic : ["/"], signedIn };
  } catch (error) {
    console.error(`AUDIT_PAGES is not a JSON array of paths: ${String(error)}`);
    return { public: ["/"], signedIn: ["/dashboard"] };
  }
}

/** This build's own product name, so the rename check never flags it. */
function brandName() {
  try {
    const source = readFileSync("src/brand.ts", "utf8");
    return /"name":\s*"([^"]+)"/.exec(source)?.[1] ?? "";
  } catch {
    return "";
  }
}

/** Strings that mean the template was never renamed into a product. */
const TEMPLATE_STRINGS = [
  "Clone Kit",
  "Clone Template",
  "ideawave-clone-template",
  "lorem ipsum",
  "Lorem ipsum",
  "localhost:3000",
  "your-product",
  "TODO",
].filter((needle) => needle !== brandName());

const findings = [];
const screenshots = [];

/**
 * @param {"error"|"warn"} severity
 * @param {string} rule
 * @param {string} page
 * @param {number} width
 * @param {string} detail
 */
function finding(severity, rule, page, width, detail) {
  findings.push({ severity, rule, page, width, detail });
}

/** Everything the page can tell us about itself, measured in one pass. */
const COLLECT = () => {
  const visible = (el) => {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  const srgb = (channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const luminance = (rgb) => 0.2126 * srgb(rgb[0]) + 0.7152 * srgb(rgb[1]) + 0.0722 * srgb(rgb[2]);
  const parse = (value) => {
    const match = /rgba?\(([^)]+)\)/.exec(value);
    if (!match) return null;
    const parts = match[1].split(",").map((p) => Number.parseFloat(p.trim()));
    if (parts.length < 3 || parts.some((p) => Number.isNaN(p))) return null;
    return { rgb: [parts[0], parts[1], parts[2]], alpha: parts[3] ?? 1 };
  };
  const backgroundOf = (el) => {
    let node = el;
    while (node) {
      const parsed = parse(getComputedStyle(node).backgroundColor);
      if (parsed && parsed.alpha > 0.5) return parsed.rgb;
      node = node.parentElement;
    }
    return [0, 0, 0];
  };
  const contrast = (a, b) => {
    const la = luminance(a);
    const lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };

  const textNodes = [...document.querySelectorAll("p, li, td, th, span, a, h1, h2, h3, h4, button, label")]
    .filter((el) => visible(el) && (el.textContent ?? "").trim().length > 12)
    .filter((el) => [...el.children].every((child) => (child.textContent ?? "").trim().length === 0))
    .slice(0, 160);

  const lowContrast = [];
  for (const el of textNodes) {
    const colour = parse(getComputedStyle(el).color);
    if (!colour) continue;
    const ratio = contrast(colour.rgb, backgroundOf(el));
    const size = Number.parseFloat(getComputedStyle(el).fontSize);
    const weight = Number(getComputedStyle(el).fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const floor = large ? 3 : 4.5;
    if (ratio < floor) {
      lowContrast.push({
        text: (el.textContent ?? "").trim().slice(0, 60),
        ratio: Math.round(ratio * 100) / 100,
        floor,
      });
    }
  }

  /* Two floors, because one number is wrong for both kinds of control. A
     control you press - a button, a field, a disclosure - gets 40px, which is
     what a thumb needs. A link inside a sentence gets WCAG 2.5.8's 24px, since
     padding a text link to 40px would wreck the line it sits in. */
  const targets = [...document.querySelectorAll("a[href], button, [role=button], input, select, summary")]
    .filter(visible)
    .map((el) => {
      const rect = el.getBoundingClientRect();
      const classes = el.className.toString();
      /* `btn-link` is the type-only variant, so it is judged as a text link
         even though it carries the shared `btn` class. */
      const looksLikeButton =
        el.tagName !== "A" ||
        el.getAttribute("role") === "button" ||
        (classes.includes("btn") && !classes.includes("btn-link"));
      return { el, rect, floor: looksLikeButton ? 40 : 24 };
    })
    .filter(({ rect, floor }) => rect.width < floor || rect.height < floor)
    .map(({ el, rect, floor }) => ({
      tag: el.tagName.toLowerCase(),
      label: (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 40),
      size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
      floor,
    }))
    .slice(0, 20);

  const images = [...document.querySelectorAll("img")]
    .filter((img) => img.getAttribute("alt") === null)
    .map((img) => (img.getAttribute("src") ?? "").slice(0, 80));

  const stillHidden = [...document.querySelectorAll("[data-reveal], [data-stagger-item], [data-split-unit]")]
    .filter((el) => Number(getComputedStyle(el).opacity) < 0.9)
    .map((el) => (el.textContent ?? "").trim().slice(0, 50))
    .slice(0, 10);

  const emptySections = [...document.querySelectorAll("section")]
    .filter((el) => visible(el) && (el.textContent ?? "").trim().length < 12)
    .map((el) => el.id || el.className.toString().slice(0, 40))
    .slice(0, 10);

  const headings = [...document.querySelectorAll("h1")].length;

  return {
    title: document.title,
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? "",
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    text: document.body.innerText,
    lowContrast,
    targets,
    images,
    stillHidden,
    emptySections,
    h1Count: headings,
  };
};

/** Walk the page so everything that enters on scroll has entered. */
const SETTLE = async () => {
  const walk = async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 220));
    }
  };
  await walk();
  window.scrollTo(0, 0);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await walk();
  window.scrollTo(0, 0);
};

async function auditPage(page, rawPath, width, label) {
  const expect404 = rawPath.startsWith("!");
  const path = expect404 ? rawPath.slice(1) : rawPath;
  const problems = [];
  const onConsole = (message) => {
    const text = message.text();
    const is404Noise = expect404 && text.includes("404");
    if (message.type() === "error" && !is404Noise) problems.push(`console: ${text.slice(0, 180)}`);
  };
  const onPageError = (error) => problems.push(`pageerror: ${String(error).slice(0, 180)}`);
  const onResponse = (response) => {
    const url = response.url().replace(BASE, "");
    if (response.status() >= 400 && !(expect404 && response.status() === 404 && url.startsWith(path))) {
      problems.push(`http ${response.status()}: ${url.slice(0, 100)}`);
    }
  };
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("response", onResponse);

  let status = 0;
  try {
    const response = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
    status = response?.status() ?? 0;
  } catch (error) {
    finding("error", "unreachable", path, width, `could not load: ${String(error).slice(0, 120)}`);
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    page.off("response", onResponse);
    return;
  }

  if (expect404 && status !== 404) {
    finding("error", "status", path, width, `expected 404, responded ${status}`);
  } else if (!expect404 && status >= 400) {
    finding("error", "status", path, width, `responded ${status}`);
  }

  await page.evaluate(SETTLE);
  await page.waitForTimeout(900);

  const name = `${label}-${path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-")}-${width}`;
  const file = join(OUT, `${name}.png`);
  const viewportHeight = page.viewportSize()?.height ?? 900;
  await page.screenshot({
    path: file,
    ...(width === 390
      ? { fullPage: false }
      : { clip: { x: 0, y: 0, width, height: Math.min(viewportHeight * MAX_VIEWPORTS, 20000) }, fullPage: true }),
  });
  screenshots.push({ name, file, page: path, width, pass: PASS });

  const data = await page.evaluate(COLLECT);

  if (!data.title.trim()) finding("error", "title", path, width, "the page has no <title>");
  if (data.overflow) {
    finding("error", "overflow", path, width, `scrolls sideways: ${data.scrollWidth}px in ${data.innerWidth}px`);
  }
  if (data.h1Count === 0) finding("warn", "heading", path, width, "no h1 on the page");
  if (data.h1Count > 1) finding("warn", "heading", path, width, `${data.h1Count} h1 elements`);
  if (width === 1440 && path === "/" && !data.ogImage) {
    finding("warn", "og", path, width, "no og:image meta tag");
  }
  for (const item of data.lowContrast.slice(0, 8)) {
    finding("error", "contrast", path, width, `${item.ratio}:1 needs ${item.floor}:1 - "${item.text}"`);
  }
  for (const target of data.targets.slice(0, 8)) {
    finding(
      width === 390 ? "error" : "warn",
      "tap-target",
      path,
      width,
      `${target.tag} is ${target.size}, needs ${target.floor}px - "${target.label}"`,
    );
  }
  for (const src of data.images.slice(0, 5)) finding("error", "alt", path, width, `img without alt: ${src}`);
  for (const text of data.stillHidden) finding("error", "hidden", path, width, `never became visible: "${text}"`);
  for (const section of data.emptySections) finding("warn", "empty-section", path, width, `section renders nothing: ${section}`);
  for (const needle of TEMPLATE_STRINGS) {
    if (data.text.includes(needle)) finding("error", "template-string", path, width, `page still says "${needle}"`);
  }
  for (const problem of [...new Set(problems)].slice(0, 8)) {
    finding(problem.startsWith("http 4") || problem.startsWith("http 5") ? "warn" : "error", "runtime", path, width, problem);
  }

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("response", onResponse);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const pages = parsePages();
  const browser = await chromium.launch();

  for (const width of PUBLIC_WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: width < 500 ? 844 : 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    for (const path of pages.public) await auditPage(page, path, width, `pass${PASS}`);
    await context.close();
  }

  if (pages.signedIn.length > 0) {
    const context = await browser.newContext({
      viewport: { width: SIGNED_IN_WIDTH, height: 900 },
      deviceScaleFactor: 1,
    });

    let signedIn = false;
    if (DEMO_EMAIL && DEMO_PASSWORD) {
      try {
        /* Sign in through the API rather than the form: the cookie jar is shared
           with the context, and a changed sign-in page cannot break the audit. */
        const response = await context.request.post(`${BASE}/api/auth/sign-in/email`, {
          data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
          headers: { "content-type": "application/json" },
        });
        signedIn = response.ok();
        if (!signedIn) {
          finding("warn", "demo-login", "/api/auth/sign-in/email", SIGNED_IN_WIDTH, `sign-in returned ${response.status()}`);
        }
      } catch (error) {
        finding("warn", "demo-login", "/api/auth/sign-in/email", SIGNED_IN_WIDTH, String(error).slice(0, 120));
      }
    } else {
      finding("warn", "demo-login", "-", SIGNED_IN_WIDTH, "AUDIT_DEMO_EMAIL or AUDIT_DEMO_PASSWORD is not set");
    }

    if (signedIn) {
      const page = await context.newPage();
      for (const path of pages.signedIn) await auditPage(page, path, SIGNED_IN_WIDTH, `pass${PASS}`);
    }
    await context.close();
  }

  await browser.close();

  const errors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warn");
  /* Errors are what must be fixed; warnings are judgement calls, so they can
     cost at most 20 points however many there are. */
  const score = Math.max(0, 100 - errors.length * 10 - Math.min(20, warnings.length));
  const report = {
    pass: PASS,
    ok: errors.length === 0,
    score,
    base: BASE,
    counts: { errors: errors.length, warnings: warnings.length, screenshots: screenshots.length },
    findings,
    screenshots,
  };

  writeFileSync(join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const lines = [
    `# Design audit, pass ${PASS}`,
    "",
    `Score ${score}/100. ${errors.length} to fix, ${warnings.length} to consider. ${screenshots.length} screenshots.`,
    "",
    "## Look at these",
    "",
    ...screenshots.map((shot) => `- \`${shot.file}\` - ${shot.page} at ${shot.width}px`),
    "",
    "## Findings",
    "",
    ...(findings.length === 0
      ? ["Nothing found. Look at the screenshots anyway."]
      : findings.map((f) => `- **${f.severity}** \`${f.rule}\` ${f.page} @${f.width}: ${f.detail}`)),
    "",
  ];
  writeFileSync(join(OUT, "report.md"), lines.join("\n"), "utf8");

  console.log(`audit pass ${PASS}: score ${score}/100, ${errors.length} errors, ${warnings.length} warnings`);
  for (const f of findings.slice(0, 20)) console.log(`  ${f.severity} ${f.rule} ${f.page}@${f.width}: ${f.detail}`);
  console.log(`report: ${join(OUT, "report.json")}`);
}

main().catch((error) => {
  console.error(`audit could not run: ${String(error)}`);
  process.exit(1);
});
