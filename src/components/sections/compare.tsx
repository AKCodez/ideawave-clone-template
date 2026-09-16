import type { ReactElement } from "react";
import { clsx } from "clsx";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import type { CompareEntry } from "@/content/compare";
import { appName } from "@/lib/env";
import { Section, SectionHeader } from "./section";

/**
 * Compare: the side-by-side, lifted out of `/compare/[slug]` so the route only
 * has to hand it an entry.
 *
 * Three columns: the feature, what this product does, what the incumbent does.
 * The middle column is the emphasised one - an accent-soft header cell and ink
 * text - because that is the column the reader came for.
 *
 * The `CompareEntry` is the ONE place a competitor may be named. Nothing in
 * this file writes a claim about anybody: every string comes from the entry.
 *
 * At 390px the table scrolls inside its own container (Table wraps itself in an
 * `overflow-x-auto` box) and the page does not move sideways. The min width
 * below is what keeps three columns of prose readable rather than squeezed into
 * one word per line.
 */

/** Below this the three columns stop being readable, so the table scrolls instead. */
const TABLE_MIN = "min-w-[46rem]";

export type CompareProps = {
  entry: CompareEntry;
  id?: string;
  /**
   * Renders the entry title as the page heading (an h1) with the summary under
   * it. Pass false when composing under a page that already has its own h1.
   */
  showHeading?: boolean;
};

export function Compare({ entry, id, showHeading = true }: CompareProps): ReactElement {
  return (
    <Section id={id} width="wide">
      {showHeading ? (
        <SectionHeader as="h1" title={entry.title} description={entry.summary} />
      ) : null}

      <div className={clsx(showHeading && "mt-stack")}>
        <Table className={TABLE_MIN}>
          <caption className="sr-only">
            {`How ${appName} compares with ${entry.incumbent}, feature by feature.`}
          </caption>

          <THead>
            <TR>
              <TH className="w-1/4">Feature</TH>
              <TH className="bg-accent-soft">
                <span className="text-ink">{appName}</span>
              </TH>
              <TH>{entry.incumbent}</TH>
            </TR>
          </THead>

          <TBody>
            {entry.rows.map((row) => (
              <TR key={row.feature}>
                <TH scope="row" className="align-top">
                  <span className="text-ink">{row.feature}</span>
                </TH>
                <TD className="align-top">{row.us}</TD>
                <TD className="align-top">
                  <span className="text-muted">{row.them}</span>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </Section>
  );
}
