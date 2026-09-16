import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Compare, CtaBand, Section } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { compareEntries, getCompareEntry } from "@/content/compare";
import { ctaBand } from "@/content/marketing";

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

/** The page is the back link, the Compare section and the band. The table lives
 *  in the section, so a landing page can show the same comparison inline. */
export default async function ComparePage({ params }: PageProps): Promise<ReactElement> {
  const { slug } = await params;
  const entry = getCompareEntry(slug);
  if (!entry) notFound();

  return (
    <>
      <Section space="tight" width="wide" className="pt-stack">
        <Button asChild variant="link" size="sm">
          <Link href="/compare">
            <ArrowLeftIcon aria-hidden="true" weight="bold" className="size-4" />
            All comparisons
          </Link>
        </Button>
      </Section>

      <Compare entry={entry} />

      <CtaBand title={ctaBand.title} body={ctaBand.body} primary={ctaBand.primary} />
    </>
  );
}
