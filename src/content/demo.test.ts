import { describe, expect, it } from "vitest";
import { demoPersona, demoSnippets, demoSnippetsWithDates } from "@/content/demo";
import { DEMO_LOGIN } from "@/design/types";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("demoPersona", () => {
  it("is the account the seed and the audit sign in with", () => {
    expect(demoPersona.email).toBe(DEMO_LOGIN.email);
    expect(demoPersona.name.length).toBeGreaterThan(1);
    expect(demoPersona.workspaceName.length).toBeGreaterThan(1);
  });
});

describe("demoSnippets", () => {
  it("has enough rows to fill a table and a product frame", () => {
    expect(demoSnippets.length).toBeGreaterThanOrEqual(10);
    expect(demoSnippets.length).toBeLessThanOrEqual(12);
  });

  it("has a unique title per row, because the seed matches on it", () => {
    const titles = demoSnippets.map((snippet) => snippet.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("runs newest first and never into the future", () => {
    const days = demoSnippets.map((snippet) => snippet.daysAgo);
    expect(days.every((day) => day >= 0)).toBe(true);
    expect([...days].sort((a, b) => a - b)).toEqual(days);
  });

  it("precomputes a summary and tags for every READY row", () => {
    for (const snippet of demoSnippets.filter((row) => row.status === "READY")) {
      expect(snippet.summary, snippet.title).toBeTruthy();
      expect(snippet.tags.length, snippet.title).toBeGreaterThan(0);
    }
  });

  it("leaves DRAFT rows unsummarised, so both states are visible", () => {
    const drafts = demoSnippets.filter((row) => row.status === "DRAFT");
    expect(drafts.length).toBeGreaterThan(0);
    for (const draft of drafts) {
      expect(draft.summary, draft.title).toBeNull();
      expect(draft.tags, draft.title).toEqual([]);
    }
  });

  it("writes real sentences, not placeholder text", () => {
    for (const snippet of demoSnippets) {
      expect(snippet.source.length, snippet.title).toBeGreaterThan(80);
      expect(snippet.source.toLowerCase(), snippet.title).not.toContain("lorem");
    }
  });

  it("uses plain hyphens everywhere", () => {
    const text = JSON.stringify(demoSnippets) + JSON.stringify(demoPersona);
    expect(text).not.toContain("—");
    expect(text).not.toContain("–");
  });
});

describe("demoSnippetsWithDates", () => {
  const now = new Date("2026-09-16T12:00:00.000Z");

  it("dates every row relative to now", () => {
    const rows = demoSnippetsWithDates(now);
    expect(rows).toHaveLength(demoSnippets.length);

    for (const [index, row] of rows.entries()) {
      const age = now.getTime() - row.createdAt.getTime();
      expect(age, row.title).toBeGreaterThanOrEqual(row.daysAgo * DAY_MS);
      // Never more than the stated age plus the within-day spread.
      expect(age, row.title).toBeLessThan((row.daysAgo + 1) * DAY_MS);
      expect(row.title).toBe(demoSnippets[index]?.title);
    }
  });

  it("puts the newest row first and gives no two rows the same instant", () => {
    const stamps = demoSnippetsWithDates(now).map((row) => row.createdAt.getTime());
    expect([...stamps].sort((a, b) => b - a)).toEqual(stamps);
    expect(new Set(stamps).size).toBe(stamps.length);
  });

  it("is deterministic for the same now", () => {
    expect(demoSnippetsWithDates(now)).toEqual(demoSnippetsWithDates(new Date(now)));
  });

  it("copies the tags rather than handing out the source array", () => {
    const rows = demoSnippetsWithDates(now);
    const first = rows[0];
    expect(first).toBeDefined();
    first?.tags.push("mutated");
    expect(demoSnippets[0]?.tags).not.toContain("mutated");
  });
});
