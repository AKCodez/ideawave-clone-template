/**
 * The seeded demo content, written out by hand.
 *
 * Both the seed (`prisma/seed.ts`) and the landing page's `ProductFrame` read
 * this file, so the screenshot on the marketing page and the table a reviewer
 * sees after signing in are the same rows. That is the whole point: a preview
 * where the hero lies about the product is worse than no hero.
 *
 * Two rules when you replace this with your own feature's data:
 *
 *   1. Every derived field is precomputed. `summary` and `tags` are written
 *      here, never generated, so seeding a fresh database never needs an AI
 *      call, a key, or a network.
 *   2. Dates are relative (`daysAgo`), never literal. A seeded row dated last
 *      March makes a live preview look abandoned.
 *
 * The content reads like one person's research log because that is what the
 * example feature is. Nothing here is a testimonial, a customer count or a
 * revenue figure - a demo that invents proof is a demo nobody can ship.
 */
import { DEMO_LOGIN } from "@/design/types";

export type DemoPersona = {
  name: string;
  /**
   * The seeded account. Never render this in the UI: the demo banner is the
   * only place a preview may show the demo address.
   */
  email: string;
  workspaceName: string;
};

export const demoPersona: DemoPersona = {
  name: "Dana Okafor",
  email: DEMO_LOGIN.email,
  workspaceName: "Customer signal",
};

/** Mirrors the `SnippetStatus` enum in prisma/schema.prisma. */
export type DemoSnippetStatus = "DRAFT" | "READY";

/** One row of `Snippet`, plus how long ago it was captured. */
export type DemoSnippet = {
  title: string;
  source: string;
  /** Null for a row that has not been summarised yet. Both states are real. */
  summary: string | null;
  tags: string[];
  status: DemoSnippetStatus;
  /** Whole days before "now". 0 is today. */
  daysAgo: number;
};

export type DemoSnippetWithDate = DemoSnippet & { createdAt: Date };

export const demoSnippets: readonly DemoSnippet[] = [
  {
    title: "Kickoff call with Northwind Logistics",
    source:
      "They run four warehouses and still reconcile stock by hand every Friday. The ops lead said the spreadsheet is the product and everyone is afraid of it. It has forked into private copies because the shared one keeps getting overwritten mid-count.",
    summary:
      "Northwind counts stock by hand every Friday across four warehouses. The shared spreadsheet has forked into private copies, so the real problem is trust in the number, not the counting.",
    tags: ["ops", "onboarding", "spreadsheets"],
    status: "READY",
    daysAgo: 1,
  },
  {
    title: "Support thread: CSV export",
    source:
      "The export ask came back again this week. One team is sending the file to their accountant, another is pasting it into a dashboard they built themselves. Nobody asked for an API, and nobody asked for a scheduled report.",
    summary:
      "Export requests are about handing data to someone outside the tool, not about integrating with it. A plain download closes both threads.",
    tags: ["exports", "support", "accounting"],
    status: "READY",
    daysAgo: 2,
  },
  {
    title: "Churn call: Halvorsen Studio",
    source:
      "They cancelled at the end of the trial. It was not the price. They said they could never tell which teammate changed a record, so they stopped trusting it for client work and went back to a shared doc with initials in the margin.",
    summary:
      "Cancelled over missing attribution, not cost. Client work needs a visible trail of who changed what before a studio will rely on it.",
    tags: ["churn", "trust", "collaboration"],
    status: "READY",
    daysAgo: 3,
  },
  {
    title: "Forum thread on manual QA checklists",
    source:
      "Long thread about QA checklists on a warehouse ops forum. The top comment is someone pasting their own doc template, and every reply under it is asking for a copy. Not one paid tool is named anywhere in the thread.",
    summary:
      "Teams are trading a doc template instead of buying software. The gap is distribution of a good checklist, not another feature.",
    tags: ["research", "qa", "competitors"],
    status: "READY",
    daysAgo: 4,
  },
  {
    title: "Sales call: Pellman Freight",
    source:
      "Forty-five minutes, mostly them talking about the handoff between dispatch and billing and how a load can sit in neither system for a day. Recording is in the shared drive. Needs a second listen before I trust these notes.",
    summary: null,
    tags: [],
    status: "DRAFT",
    daysAgo: 5,
  },
  {
    title: "Where new accounts stall",
    source:
      "Watched last week's session recordings end to end. Almost everyone stops at the import step. A couple opened the help panel, read for a while and closed the tab. The one person who got through skipped import entirely and typed straight into the empty table.",
    summary:
      "Import is where new accounts stall. The person who succeeded ignored it and typed into the empty state, which says the empty state should be the default path rather than the fallback.",
    tags: ["onboarding", "activation"],
    status: "READY",
    daysAgo: 6,
  },
  {
    title: "Teardown: a competitor's pricing page",
    source:
      "Their pricing page leads with seats and every plan gates exports. The FAQ spends three answers explaining what counts as an active user, and the top post on their own forum is people arguing about the meter.",
    summary:
      "Seat and usage pricing is costing them goodwill: their FAQ and their forum are both busy defending the meter. Flat pricing is a difference we can state in one line.",
    tags: ["competitors", "pricing"],
    status: "READY",
    daysAgo: 7,
  },
  {
    title: "Interview: night-shift supervisor",
    source:
      "He does the whole shift from a phone in a cold store with gloves on, and types with a stylus because the screen ignores the gloves. Anything that needs two hands or a precise tap simply does not get done until morning.",
    summary:
      "The primary device is a phone used with gloves and a stylus in the cold. Large tap targets and one-handed flows are a requirement here, not a polish item.",
    tags: ["interview", "mobile", "ops"],
    status: "READY",
    daysAgo: 9,
  },
  {
    title: "The question we keep answering",
    source:
      "Same question again: where does an archived record go, and can it come back. The answer is yes, from the filters menu, but nobody finds the filters menu and everyone assumes the record is gone.",
    summary:
      "Archive is discoverable enough to use and not discoverable enough to undo. Restore belongs where the archive action was, not behind a filter.",
    tags: ["support", "docs"],
    status: "READY",
    daysAgo: 11,
  },
  {
    title: "Notes from the ops meetup",
    source:
      "Three conversations worth writing up properly: the freight dispatcher who still prints the run sheet, the person doing inventory for a group of bakeries, and someone holding an internal tool together with spreadsheets and webhooks. Written on the back of the schedule.",
    summary: null,
    tags: [],
    status: "DRAFT",
    daysAgo: 13,
  },
  {
    title: "Feature request: a Monday digest",
    source:
      "Asked for again: an email on Monday morning saying what changed last week. The person who asked is already forwarding themselves a screenshot every Monday to do exactly that.",
    summary:
      "A weekly change digest is being simulated by hand already. The screenshot habit tells us what the email should contain: what changed, and nothing else.",
    tags: ["feature-request", "email"],
    status: "READY",
    daysAgo: 16,
  },
  {
    title: "Post-mortem: the Friday import outage",
    source:
      "Imports failed for about two hours on Friday afternoon. Nobody filed a ticket. The first we heard was someone asking in chat whether their file was wrong, because they assumed the failure was their own fault.",
    summary:
      "An outage read as user error, so it went unreported. A failed import needs a message that names the system as the cause and a retry the user can see.",
    tags: ["incident", "imports", "trust"],
    status: "READY",
    daysAgo: 19,
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The same rows with real `createdAt` values, counted back from `now`.
 *
 * Each row also lands at its own minute rather than all on the same one,
 * because a table where every timestamp matches reads as fake at a glance.
 * Deterministic and timezone-free: the same `now` always gives the same dates.
 */
export function demoSnippetsWithDates(now: Date = new Date()): DemoSnippetWithDate[] {
  return demoSnippets.map((snippet, index) => {
    const spreadMinutes = (index * 97) % 300;
    const createdAt = new Date(
      now.getTime() - snippet.daysAgo * DAY_MS - spreadMinutes * 60 * 1000,
    );
    return { ...snippet, tags: [...snippet.tags], createdAt };
  });
}
