import type { ReactElement } from "react";
import { clsx } from "clsx";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";

/**
 * The example feature's list, rendered in exactly one place.
 *
 * The signed-in dashboard passes rows from the database and a delete action;
 * the landing page's ProductFrame passes the seeded demo rows and no action.
 * That is deliberate: what a visitor sees on the marketing page is the same
 * component, with the same data, that they get after signing in.
 */

export type SnippetRow = {
  id: string;
  title: string;
  summary: string | null;
  tags: readonly string[];
  status: "DRAFT" | "READY";
  createdAt: Date;
};

export type SnippetListProps = {
  snippets: readonly SnippetRow[];
  /** Given a server action, every row gets a delete button wired to it. */
  deleteAction?: (formData: FormData) => Promise<void>;
  /** `compact` drops the summary line, for the narrow marketing frame. */
  density?: "comfortable" | "compact";
  className?: string;
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});

export function SnippetList({
  snippets,
  deleteAction,
  density = "comfortable",
  className,
}: SnippetListProps): ReactElement {
  const compact = density === "compact";

  return (
    <Table className={className}>
      <THead>
        <TR>
          <TH>Snippet</TH>
          <TH>Status</TH>
          <TH align="right">Saved</TH>
          {deleteAction ? (
            <TH className="w-px">
              <span className="sr-only">Actions</span>
            </TH>
          ) : null}
        </TR>
      </THead>
      <TBody>
        {snippets.map((snippet) => (
          <TR key={snippet.id}>
            <TD className="max-w-0">
              <span className="block truncate text-ink">{snippet.title}</span>
              {compact || !snippet.summary ? null : (
                <span className="mt-1 block truncate text-small text-muted">{snippet.summary}</span>
              )}
              {snippet.tags.length > 0 ? (
                <span className={clsx("mt-2 flex flex-wrap gap-1.5", compact && "mt-1")}>
                  {snippet.tags.slice(0, compact ? 2 : 4).map((tag) => (
                    <Badge key={tag} tone="neutral">
                      {tag}
                    </Badge>
                  ))}
                </span>
              ) : null}
            </TD>
            <TD>
              <Badge tone={snippet.status === "READY" ? "positive" : "neutral"}>
                {snippet.status === "READY" ? "Ready" : "Draft"}
              </Badge>
            </TD>
            <TD align="right" className="whitespace-nowrap">
              {dateFormat.format(snippet.createdAt)}
            </TD>
            {deleteAction ? (
              <TD className="text-right">
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={snippet.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    <TrashIcon aria-hidden="true" weight="regular" className="size-4" />
                    <span className="sr-only sm:not-sr-only">Delete</span>
                  </Button>
                </form>
              </TD>
            ) : null}
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
