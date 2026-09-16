"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactElement, type ReactNode } from "react";
import { clsx } from "clsx";

/**
 * The one place in this kit where something is allowed to travel between
 * positions: the indicator under the active tab. It moves by transform over a
 * fixed-width track, so nothing is measured and nothing reflows.
 *
 * Keyboard: left and right arrows move, Home and End jump, and only the active
 * tab is in the tab order (roving tabindex), which is what a tablist owes you.
 */
export type TabItem = {
  value: string;
  label: string;
  content: ReactNode;
};

export type TabsProps = {
  items: readonly TabItem[];
  /** Defaults to the first item. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name for the tablist. */
  label: string;
  className?: string;
};

export function Tabs({
  items,
  defaultValue,
  onValueChange,
  label,
  className,
}: TabsProps): ReactElement | null {
  const first = items[0];
  const [active, setActive] = useState<string>(defaultValue ?? first?.value ?? "");
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();

  if (!first) return null;

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.value === active),
  );

  function select(index: number): void {
    const item = items[index];
    if (!item) return;
    setActive(item.value);
    onValueChange?.(item.value);
    buttons.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const last = items.length - 1;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      select(activeIndex === last ? 0 : activeIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      select(activeIndex === 0 ? last : activeIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      select(0);
    } else if (event.key === "End") {
      event.preventDefault();
      select(last);
    }
  }

  return (
    <div className={clsx("flex flex-col gap-6", className)}>
      <div
        role="tablist"
        aria-label={label}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="relative grid w-full rounded-input border-(length:--stroke) border-line bg-surface p-1"
        style={{ gridTemplateColumns: "repeat(" + items.length + ", minmax(0, 1fr))" }}
      >
        <span
          aria-hidden="true"
          className="tab-indicator absolute top-1 bottom-1 left-1 rounded-input bg-elevated"
          style={{
            width: "calc((100% - 0.5rem) / " + items.length + ")",
            transform: "translateX(" + activeIndex * 100 + "%)",
          }}
        />
        {items.map((item, index) => {
          const selected = item.value === active;
          return (
            <button
              key={item.value}
              ref={(node) => {
                buttons.current[index] = node;
              }}
              type="button"
              role="tab"
              id={base + "-tab-" + item.value}
              aria-controls={base + "-panel-" + item.value}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(index)}
              className={clsx(
                "btn relative z-10 h-9 rounded-input px-3 text-small font-medium",
                selected ? "text-ink" : "text-muted hover:text-ink",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item) => (
        <div
          key={item.value}
          role="tabpanel"
          id={base + "-panel-" + item.value}
          aria-labelledby={base + "-tab-" + item.value}
          tabIndex={0}
          hidden={item.value !== active}
        >
          {item.value === active ? item.content : null}
        </div>
      ))}
    </div>
  );
}
