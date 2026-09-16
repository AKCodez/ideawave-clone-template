import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Built from the IdeaWave clone template.</p>
        <div className="flex gap-4">
          <Link href="/compare" className="transition-colors hover:text-ink">
            Compare
          </Link>
          <Link href="/premium" className="transition-colors hover:text-ink">
            Pricing
          </Link>
          <Link href="/sign-up" className="transition-colors hover:text-ink">
            Create account
          </Link>
        </div>
      </div>
    </footer>
  );
}
