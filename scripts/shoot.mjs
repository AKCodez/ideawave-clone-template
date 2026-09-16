#!/usr/bin/env node
/**
 * Screenshot a running server at several widths.
 *
 *   BASE=http://localhost:3100 TAG=editorial node scripts/shoot.mjs
 *
 * Scrolls the whole page before capturing, because every section enters on
 * `whileInView`: a full-page screenshot taken without scrolling shows a page of
 * empty boxes, which is the screenshot lying, not the page being broken.
 *
 * Reports the HTTP status, any console or page error, and whether the document
 * scrolls sideways at that width.
 */
import { chromium } from "playwright";

const BASE = (process.env.BASE ?? "http://localhost:3100").replace(/\/+$/, "");
const OUT = process.env.OUT ?? "preview/shots";
const PAGES = JSON.parse(process.env.PAGES ?? '["/","/sign-in","/compare","/premium"]');
const WIDTHS = JSON.parse(process.env.WIDTHS ?? "[1440,390]");
const TAG = process.env.TAG ?? "now";
const REDUCED = process.env.REDUCED === "1";

const browser = await chromium.launch();
let failures = 0;

for (const width of WIDTHS) {
  const context = await browser.newContext({
    viewport: { width, height: width < 500 ? 844 : 900 },
    deviceScaleFactor: 1,
    ...(REDUCED ? { reducedMotion: "reduce" } : {}),
  });
  const page = await context.newPage();
  const problems = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console: ${message.text().slice(0, 200)}`);
  });
  page.on("pageerror", (error) => problems.push(`pageerror: ${String(error).slice(0, 200)}`));
  page.on("response", (response) => {
    if (response.status() >= 400) problems.push(`${response.status()} ${response.url().slice(0, 140)}`);
  });

  for (const path of PAGES) {
    const response = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });

    /* Walk the page twice so every whileInView section has actually entered.
       Twice, because a section that reveals with a clip-path hides the sections
       nested inside it from the observer until its own reveal has finished: one
       fast pass leaves those children waiting, exactly as a reader who scrolls
       faster than the page animates would briefly see. */
    await page.evaluate(async () => {
      const walk = async () => {
        const step = Math.round(window.innerHeight * 0.6);
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 260));
        }
      };
      await walk();
      window.scrollTo(0, 0);
      await new Promise((resolve) => setTimeout(resolve, 400));
      await walk();
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);

    const name = path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-");
    const file = `${OUT}/${TAG}-${name}-${width}.png`;
    await page.screenshot({ path: file, fullPage: width >= 1024 });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll("[data-reveal], [data-stagger-item]")].filter(
        (element) => Number(getComputedStyle(element).opacity) < 0.9,
      ).length,
    );

    const notes = [overflow ? "OVERFLOW" : "", hidden > 0 ? `${hidden} still hidden` : ""]
      .filter(Boolean)
      .join(" ");
    if (overflow || hidden > 0) failures += 1;
    console.log(`${response?.status()} ${width} ${path} -> ${file}${notes ? `  ${notes}` : ""}`);
  }

  for (const problem of [...new Set(problems)]) {
    console.log(`  ${width}: ${problem}`);
    failures += 1;
  }
  await context.close();
}

await browser.close();
process.exit(failures > 0 ? 1 : 0);
