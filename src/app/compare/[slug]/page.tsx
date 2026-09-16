import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
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

export default async function ComparePage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getCompareEntry(slug);
  if (!entry) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16">
      <Link href="/compare" className="text-sm text-muted transition-colors hover:text-ink">
        All comparisons
      </Link>
      <h1 className="mt-4 text-3xl sm:text-4xl">{entry.title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{entry.summary}</p>

      <div className="mt-10 overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th scope="col" className="px-4 py-3 font-medium text-muted">
                Feature
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-ink">
                This app
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted">
                {entry.incumbent}
              </th>
            </tr>
          </thead>
          <tbody>
            {entry.rows.map((row) => (
              <tr key={row.feature} className="border-b border-line last:border-b-0">
                <th scope="row" className="px-4 py-4 align-top font-medium text-ink">
                  {row.feature}
                </th>
                <td className="px-4 py-4 align-top text-ink">{row.us}</td>
                <td className="px-4 py-4 align-top text-muted">{row.them}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Badge tone="accent">Free to start</Badge>
        <Link href="/sign-up" className={buttonClasses("primary", "md")}>
          Create an account
        </Link>
      </div>
    </div>
  );
}
