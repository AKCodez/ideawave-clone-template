export type CompareRow = {
  feature: string;
  us: string;
  them: string;
};

export type CompareEntry = {
  /** URL segment: /compare/<slug> */
  slug: string;
  /** Page headline. */
  title: string;
  /** What you are being compared against. */
  incumbent: string;
  /** One-sentence summary under the headline. */
  summary: string;
  rows: CompareRow[];
};

/**
 * Comparison pages are the ONE place a competitor may be named. Product copy
 * everywhere else stands on its own. Replace these two placeholders with the
 * real incumbent before launch; keep every claim in `them` factual and dated.
 */
export const compareEntries: CompareEntry[] = [
  {
    slug: "spreadsheets",
    title: "Against a spreadsheet",
    incumbent: "A spreadsheet",
    summary:
      "A spreadsheet is free and endlessly flexible. It stops being free the moment two people need the same truth at the same time.",
    rows: [
      {
        feature: "Setup time",
        us: "Sign in and start. The first record takes under a minute.",
        them: "Minutes to start, hours once formulas and tabs multiply.",
      },
      {
        feature: "Two people at once",
        us: "One shared record. Writes go through the server, so nobody overwrites anybody.",
        them: "Merge conflicts, duplicate tabs and a version everyone distrusts.",
      },
      {
        feature: "History",
        us: "Every row carries when it was created and last changed.",
        them: "Revision history exists, but not per row and not in your terms.",
      },
      {
        feature: "Cost",
        us: "Free to start, one paid tier when you outgrow it.",
        them: "Free forever, paid for in the hours spent maintaining it.",
      },
    ],
  },
  {
    slug: "in-house-scripts",
    title: "Against in-house scripts",
    incumbent: "In-house scripts",
    summary:
      "Scripts you wrote yourself fit perfectly until the person who wrote them is on holiday.",
    rows: [
      {
        feature: "Who can run it",
        us: "Anyone with an account, from a browser.",
        them: "Whoever has the repo, the credentials and the runbook.",
      },
      {
        feature: "When it breaks",
        us: "One place to look, with the error shown to the person who hit it.",
        them: "A silent cron failure noticed days later.",
      },
      {
        feature: "Onboarding",
        us: "Sign up, then use it.",
        them: "A README, a local environment and an afternoon.",
      },
      {
        feature: "Maintenance",
        us: "Included.",
        them: "Yours, forever, at the worst possible moment.",
      },
    ],
  },
];

export function getCompareEntry(slug: string): CompareEntry | undefined {
  return compareEntries.find((entry) => entry.slug === slug);
}
