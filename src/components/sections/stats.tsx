import type { ReactElement } from "react";
import { clsx } from "clsx";
import { Counter } from "@/components/motion";
import type { Stat } from "@/content/marketing";
import { tokens } from "@/design/tokens";
import { Section, SectionHeader } from "./section";

/**
 * Stats: a row of big numbers, each counted up the first time it is seen.
 *
 * Every number here is a COUNTED FACT - something in the product, the schema or
 * the repository that you can point at and recount. It is never social proof,
 * never a user count nobody measured and never a revenue figure. If you cannot
 * source it, delete the stat rather than round it up.
 *
 * The grid is one column on a phone, two at sm and four at lg, so four stats
 * never break into an ugly three-and-one. Three stats take three columns at lg
 * and two take two, for the same reason.
 *
 * Direction behaviour it carries: the rule above each number is a hairline
 * everywhere except brutal, which draws it at `--stroke-strong` in
 * `line-strong`.
 */

const direction = tokens.direction.key;

const RULE =
  direction === "brutal"
    ? "border-t-(length:--stroke-strong) border-line-strong"
    : "border-t-(length:--stroke) border-line";

/** Column counts, spelled out so Tailwind can see every class it must emit. */
function gridFor(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
}

export type StatsProps = {
  stats: readonly Stat[];
  /** Omit to render the numbers with no header at all. */
  title?: string;
  description?: string;
  id?: string;
};

export function Stats({ stats, title, description, id }: StatsProps): ReactElement {
  if (tokens.brand.composition.stats === "rows") {
    // The composition's "rows" style: a ruled table, one fact per row, the
    // number right-aligned in tabular figures. Same counted facts, read as a
    // ledger instead of a billboard.
    return (
      <Section id={id}>
        {title ? <SectionHeader title={title} description={description} /> : null}
        <ul className={clsx("flex flex-col", title && "mt-stack")}>
          {stats.map((stat) => (
            <li key={stat.label} className={clsx("flex items-baseline justify-between gap-6 py-4", RULE)}>
              <p className="text-body text-muted">{stat.label}</p>
              <p className="numeric text-h2 text-ink">
                {stat.prefix}
                <Counter value={stat.value} />
                {stat.suffix}
              </p>
            </li>
          ))}
        </ul>
      </Section>
    );
  }
  return (
    <Section id={id}>
      {title ? <SectionHeader title={title} description={description} /> : null}

      <ul className={clsx("grid gap-8", gridFor(stats.length), title && "mt-stack")}>
        {stats.map((stat) => (
          <li key={stat.label} className={clsx("flex min-w-0 flex-col gap-2 pt-5", RULE)}>
            <p className="numeric text-h1 text-ink">
              {stat.prefix}
              <Counter value={stat.value} />
              {stat.suffix}
            </p>
            <p className="text-small text-muted">{stat.label}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
