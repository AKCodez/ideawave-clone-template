import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SnippetForm } from "@/components/snippet-form";
import { SignOutButton } from "@/components/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import { getCurrentUser } from "@/lib/session";
import { deleteSnippet } from "./actions";

export const metadata: Metadata = { title: "Dashboard" };

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Read on the server, render inline. No client-side fetching for first paint.
  const records = features.db
    ? await db.snippet.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  const premium = features.db
    ? await db.user.findUnique({
        where: { id: user.id },
        select: { premiumUntil: true },
      })
    : null;

  const isPremium = Boolean(premium?.premiumUntil && premium.premiumUntil > new Date());

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Your dashboard</h1>
          <p className="mt-2 text-sm text-muted">Signed in as {user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {isPremium ? (
            <Badge tone="positive">Premium</Badge>
          ) : (
            <Link href="/premium">
              <Badge tone="neutral">Free plan</Badge>
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>

      <Card className="mt-10">
        <h2 className="font-display text-xl">Add a snippet</h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          Paste something long. The example loop stores it, then summarises it.
        </p>
        <SnippetForm />
      </Card>

      <section className="mt-10">
        <h2 className="font-display text-xl">Your snippets</h2>

        {records.length === 0 ? (
          <Card className="mt-4 border-dashed">
            <p className="text-sm text-muted">
              Nothing here yet. Paste your first snippet above and it will appear in this
              list, newest first.
            </p>
          </Card>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {records.map((record) => (
              <li
                key={record.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-line bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{record.title}</p>
                  <p className="numeric mt-0.5 text-xs text-muted">
                    {dateFormat.format(record.createdAt)}
                  </p>
                </div>
                <form action={deleteSnippet}>
                  <input type="hidden" name="id" value={record.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Delete
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
