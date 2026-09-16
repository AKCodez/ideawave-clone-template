import type {
  HTMLAttributes,
  ReactElement,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { clsx } from "clsx";

/**
 * A real table, for real tabular data. The `align="right"` prop on a header or
 * a cell also applies the `numeric` utility, so money, counts and timestamps
 * line up down the column instead of wandering.
 *
 * Table wraps itself in a horizontal scroller: a table may overflow sideways,
 * the page may not.
 */
export type CellAlign = "left" | "right";

export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>): ReactElement {
  return (
    <div className="w-full overflow-x-auto rounded-lg border-(length:--stroke) border-line">
      <table
        className={clsx("w-full border-collapse text-left text-small", className)}
        {...props}
      />
    </div>
  );
}

export function THead({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>): ReactElement {
  return (
    <thead
      className={clsx("border-b-(length:--stroke) border-line bg-surface", className)}
      {...props}
    />
  );
}

export function TBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>): ReactElement {
  return <tbody className={className} {...props} />;
}

export function TR({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>): ReactElement {
  return (
    <tr
      className={clsx(
        "border-b-(length:--stroke) border-line last:border-b-0 hover:bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export type THProps = Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> & {
  align?: CellAlign;
};

export function TH({ align = "left", className, ...props }: THProps): ReactElement {
  return (
    <th
      scope="col"
      className={clsx(
        "px-4 py-3 font-medium text-muted",
        align === "right" && "numeric text-right",
        className,
      )}
      {...props}
    />
  );
}

export type TDProps = Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> & {
  align?: CellAlign;
};

export function TD({ align = "left", className, ...props }: TDProps): ReactElement {
  return (
    <td
      className={clsx(
        "px-4 py-3 align-middle text-ink",
        align === "right" && "numeric text-right",
        className,
      )}
      {...props}
    />
  );
}
