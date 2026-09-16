import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NotePencilIcon } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { SnippetForm } from "@/components/snippet-form";
import { SnippetList } from "@/components/snippet-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import { getCurrentUser } from "@/lib/session";
import { deleteSnippet } from "./actions";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage(): Promise<ReactElement> {
  // The (app) layout is the gate; this narrows the type for the query below.
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
    <div className="flex flex-col gap-stack">
      <PageHeader
        title="Your dashboard"
        description={`Signed in as ${user.email}`}
        actions={
          isPremium ? (
            <Badge tone="positive">Premium</Badge>
          ) : (
            <Button asChild variant="secondary" size="sm">
              <Link href="/premium">Free plan</Link>
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Add a snippet</CardTitle>
          <CardDescription>
            Paste something long. It saves straight away, and Summarise writes the
            one-line version and the tags.
          </CardDescription>
        </CardHeader>
        <SnippetForm />
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="text-h3 text-ink">Your snippets</h2>

        {records.length === 0 ? (
          <EmptyState
            icon={<NotePencilIcon aria-hidden="true" weight="regular" className="size-8" />}
            title="No snippets yet"
            body="Every snippet you save shows up here, newest first, with the date you saved it. Paste one into the form above to fill this list."
            action={
              <Button asChild variant="primary" size="md">
                <a href="#snippet-title">Add your first snippet</a>
              </Button>
            }
          />
        ) : (
          <SnippetList snippets={records} deleteAction={deleteSnippet} summarise />
        )}
      </section>
    </div>
  );
}
