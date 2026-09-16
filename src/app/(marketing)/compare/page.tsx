import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { compareEntries } from "@/content/compare";

export const metadata: Metadata = {
  title: "Compare",
  description: "How this stacks up against the ways people solve this today.",
};

export default function CompareIndexPage(): ReactElement {
  return (
    <div className="mx-auto w-full max-w-wide px-4 py-section sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-h1 text-ink">Compare</h1>
        <p className="max-w-prose text-lead text-muted">
          Honest side-by-sides against the ways people solve this today.
        </p>
      </header>

      <div className="mt-block grid gap-4 sm:grid-cols-2">
        {compareEntries.map((entry) => (
          <Link key={entry.slug} href={`/compare/${entry.slug}`} className="block no-underline">
            <Card interactive className="h-full">
              <CardTitle>{entry.title}</CardTitle>
              <CardDescription>{entry.summary}</CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
