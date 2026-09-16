import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { compareEntries } from "@/content/compare";

export const metadata: Metadata = {
  title: "Compare",
  description: "How this stacks up against the ways people solve this today.",
};

export default function CompareIndexPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16">
      <h1 className="text-3xl sm:text-4xl">Compare</h1>
      <p className="mt-3 max-w-xl text-muted">
        Honest side-by-sides against the ways people solve this today.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {compareEntries.map((entry) => (
          <Link key={entry.slug} href={`/compare/${entry.slug}`} className="block">
            <Card className="h-full hover:border-accent/50">
              <CardTitle>{entry.title}</CardTitle>
              <CardDescription>{entry.summary}</CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
