import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { compareEntries, getCompareEntry } from "@/content/compare";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams(): { slug: string }[] {
  return compareEntries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getCompareEntry(slug);
  if (!entry) return { title: "Compare" };
  return { title: entry.title, description: entry.summary };
}

export default async function ComparePage({ params }: PageProps): Promise<ReactElement> {
  const { slug } = await params;
  const entry = getCompareEntry(slug);
  if (!entry) notFound();

  return (
    <div className="mx-auto w-full max-w-wide px-4 py-section sm:px-6">
      <Button asChild variant="link" size="sm">
        <Link href="/compare">
          <ArrowLeftIcon aria-hidden="true" weight="bold" className="size-4" />
          All comparisons
        </Link>
      </Button>

      <h1 className="mt-6 text-h1 text-ink">{entry.title}</h1>
      <p className="mt-3 max-w-prose text-lead text-muted">{entry.summary}</p>

      <div className="mt-block">
        <Table>
          <THead>
            <TR>
              <TH>Feature</TH>
              <TH className="text-ink">This app</TH>
              <TH>{entry.incumbent}</TH>
            </TR>
          </THead>
          <TBody>
            {entry.rows.map((row) => (
              <TR key={row.feature}>
                <TH scope="row" className="align-top text-ink">
                  {row.feature}
                </TH>
                <TD className="align-top">{row.us}</TD>
                <TD className="align-top text-muted">{row.them}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      <div className="mt-block flex flex-wrap items-center gap-3">
        <Badge tone="accent">Free to start</Badge>
        <Button asChild variant="primary" size="md">
          <Link href="/sign-up">Create an account</Link>
        </Button>
      </div>
    </div>
  );
}
