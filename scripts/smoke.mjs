#!/usr/bin/env node
/**
 * Smoke test against an already-running server.
 *
 *   BASE_URL=http://localhost:3000 SMOKE_PATHS="/,/premium" node scripts/smoke.mjs
 *
 * Starts nothing itself. Asserts every path answers 200, ships a non-empty
 * <title>, and contains none of the strings a broken Next.js page renders.
 */
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const PATHS = (process.env.SMOKE_PATHS ?? "/")
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);

const FORBIDDEN = ["Application error", "Internal Server Error", "could not be found"];

/**
 * Next inlines its default 404 markup into the RSC flight payload inside
 * <script> tags on every page, so the forbidden strings are only meaningful
 * once script and template contents are removed.
 * @param {string} html
 */
function visibleMarkup(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<template[\s\S]*?<\/template>/gi, "");
}

/** @param {string} path */
async function check(path) {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    const response = await fetch(url, { headers: { accept: "text/html" } });
    const body = visibleMarkup(await response.text());

    if (response.status !== 200) return { path, status: response.status, title: "", ok: false, reason: `status ${response.status}` };

    const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(body);
    const title = match?.[1]?.trim() ?? "";
    if (!title) return { path, status: response.status, title: "", ok: false, reason: "empty <title>" };

    const hit = FORBIDDEN.find((needle) => body.includes(needle));
    if (hit) return { path, status: response.status, title, ok: false, reason: `contains "${hit}"` };

    return { path, status: response.status, title, ok: true, reason: "" };
  } catch (error) {
    return { path, status: 0, title: "", ok: false, reason: String(error instanceof Error ? error.message : error) };
  }
}

const results = [];
for (const path of PATHS) results.push(await check(path));

const columns = [
  { key: "ok", head: "", width: 3, render: (r) => (r.ok ? "ok " : "FAIL") },
  { key: "status", head: "STATUS", width: 6, render: (r) => String(r.status) },
  { key: "path", head: "PATH", width: Math.max(4, ...results.map((r) => r.path.length)), render: (r) => r.path },
  { key: "title", head: "TITLE", width: Math.max(5, ...results.map((r) => Math.min(r.title.length, 40))), render: (r) => r.title.slice(0, 40) },
  { key: "reason", head: "NOTE", width: Math.max(4, ...results.map((r) => r.reason.length)), render: (r) => r.reason },
];

const line = (cells) => cells.map((c, i) => c.padEnd(columns[i].width)).join("  ");

console.log(`smoke: ${BASE_URL}`);
console.log(line(columns.map((c) => c.head)));
console.log(line(columns.map((c) => "-".repeat(c.width))));
for (const result of results) console.log(line(columns.map((c) => c.render(result))));

const failures = results.filter((r) => !r.ok);
console.log(`\n${results.length - failures.length}/${results.length} passed`);
process.exit(failures.length > 0 ? 1 : 0);
