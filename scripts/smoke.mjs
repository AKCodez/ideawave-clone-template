#!/usr/bin/env node
/**
 * Smoke test against an already-running server. Starts nothing itself.
 *
 *   npm run smoke
 *   BASE_URL=http://localhost:3000 SMOKE_PATHS="/,/premium" node scripts/smoke.mjs
 *
 * Every path must answer 200. What else is asserted depends on what the route
 * actually serves, so the page routes and the generated asset routes can share
 * one run:
 *
 *   html   non-empty <title>, and none of the strings a broken page renders
 *   image  a real image: the magic bytes must match the declared type
 *   json   parses, and is not an empty object
 *   xml    parses far enough to have a root element
 *   text   not blank
 *
 * Add a path and the right assertions follow from its content type.
 */
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

/** Pages first, then the six generated asset routes. */
const DEFAULT_PATHS = [
  "/",
  "/compare",
  "/premium",
  "/sign-in",
  "/opengraph-image",
  "/twitter-image",
  "/icon",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
];

const PATHS = (process.env.SMOKE_PATHS ?? DEFAULT_PATHS.join(","))
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

/** Leading bytes that prove a payload really is the image type it claims. */
const IMAGE_MAGIC = [
  { type: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { type: "jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { type: "ico", bytes: [0x00, 0x00, 0x01, 0x00] },
];

/** @param {Uint8Array} bytes */
function detectImage(bytes) {
  for (const candidate of IMAGE_MAGIC) {
    if (candidate.bytes.every((byte, i) => bytes[i] === byte)) return candidate.type;
  }
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return "webp";
  }
  const head = new TextDecoder().decode(bytes.slice(0, 200)).trimStart();
  if (head.startsWith("<svg") || head.startsWith("<?xml")) return "svg";
  return null;
}

/** @param {number} bytes */
function humanSize(bytes) {
  return bytes < 1024 ? `${bytes} B` : `${Math.round(bytes / 1024)} KB`;
}

/**
 * Which family of assertions a response gets, from its Content-Type.
 * @param {string} contentType
 */
function kindOf(contentType) {
  const type = contentType.toLowerCase();
  if (type.includes("html")) return "html";
  if (type.startsWith("image/")) return "image";
  if (type.includes("json")) return "json";
  if (type.includes("xml")) return "xml";
  return "text";
}

/** @param {string} path */
async function check(path) {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  /** @type {{path: string, status: number, kind: string, detail: string, ok: boolean, reason: string}} */
  const base = { path, status: 0, kind: "", detail: "", ok: false, reason: "" };

  let response;
  try {
    response = await fetch(url, { headers: { accept: "*/*" } });
  } catch (error) {
    return { ...base, reason: error instanceof Error ? error.message : String(error) };
  }

  const contentType = response.headers.get("content-type") ?? "";
  const kind = kindOf(contentType);
  const result = { ...base, status: response.status, kind };

  if (response.status !== 200) {
    return { ...result, reason: `status ${response.status}` };
  }

  if (kind === "image") {
    const bytes = new Uint8Array(await response.arrayBuffer());
    const detected = detectImage(bytes);
    const declared = contentType.split("/")[1]?.split(";")[0]?.trim() ?? "";
    if (bytes.length === 0) return { ...result, reason: "empty image body" };
    if (!detected) return { ...result, detail: humanSize(bytes.length), reason: "not a recognisable image" };
    if (declared.includes("svg") ? detected !== "svg" : detected !== declared) {
      return { ...result, detail: humanSize(bytes.length), reason: `declared ${declared}, bytes say ${detected}` };
    }
    return { ...result, detail: `${detected} ${humanSize(bytes.length)}`, ok: true };
  }

  const raw = await response.text();

  if (kind === "json") {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ...result, reason: "body is not valid JSON" };
    }
    const keys = parsed && typeof parsed === "object" ? Object.keys(parsed).length : 0;
    if (keys === 0) return { ...result, reason: "JSON has no entries" };
    return { ...result, detail: `${keys} keys`, ok: true };
  }

  if (kind === "xml") {
    const root = /<([a-z][\w:-]*)[\s>]/i.exec(raw.replace(/<\?[\s\S]*?\?>/g, ""));
    if (!root) return { ...result, reason: "no XML root element" };
    return { ...result, detail: `<${root[1]}> ${humanSize(raw.length)}`, ok: true };
  }

  if (kind === "html") {
    const body = visibleMarkup(raw);
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(body)?.[1]?.trim() ?? "";
    if (!title) return { ...result, reason: "empty <title>" };
    const hit = FORBIDDEN.find((needle) => body.includes(needle));
    if (hit) return { ...result, detail: title.slice(0, 32), reason: `contains "${hit}"` };
    return { ...result, detail: title.slice(0, 32), ok: true };
  }

  if (raw.trim().length === 0) return { ...result, reason: "empty body" };
  const hit = FORBIDDEN.find((needle) => raw.includes(needle));
  if (hit) return { ...result, reason: `contains "${hit}"` };
  return { ...result, detail: humanSize(raw.length), ok: true };
}

const results = [];
for (const path of PATHS) results.push(await check(path));

const columns = [
  { head: "", render: (r) => (r.ok ? "ok" : "FAIL") },
  { head: "STATUS", render: (r) => String(r.status) },
  { head: "PATH", render: (r) => r.path },
  { head: "TYPE", render: (r) => r.kind },
  { head: "DETAIL", render: (r) => r.detail },
  { head: "NOTE", render: (r) => r.reason },
].map((column) => ({
  ...column,
  width: Math.max(column.head.length, ...results.map((r) => column.render(r).length)),
}));

const line = (cells) => cells.map((cell, i) => cell.padEnd(columns[i].width)).join("  ").trimEnd();

console.log(`smoke: ${BASE_URL}`);
console.log(line(columns.map((c) => c.head)));
console.log(line(columns.map((c) => "-".repeat(c.width))));
for (const result of results) console.log(line(columns.map((c) => c.render(result))));

const failures = results.filter((r) => !r.ok);
console.log(`\n${results.length - failures.length}/${results.length} passed`);
process.exit(failures.length > 0 ? 1 : 0);
