"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { clsx } from "clsx";
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react/dist/ssr";

export type ToastTone = "neutral" | "positive" | "critical";

export type ToastOptions = {
  title: string;
  body?: string;
  tone?: ToastTone;
  /** Milliseconds before it dismisses itself. Hovering pauses the countdown. */
  duration?: number;
};

type ToastRecord = {
  id: string;
  title: string;
  body?: string;
  tone: ToastTone;
  duration: number;
};

const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 5000;

const listeners = new Set<(record: ToastRecord) => void>();
/** Toasts fired before the provider mounted, replayed when it does. */
const queued: ToastRecord[] = [];
let sequence = 0;

/**
 * Fire a toast from anywhere - a Server Action result, an event handler, a
 * module with no React in it. If the provider is not mounted yet the toast
 * waits for it rather than disappearing.
 */
export function toast(options: ToastOptions): void {
  sequence += 1;
  const record: ToastRecord = {
    id: "toast-" + sequence,
    title: options.title,
    body: options.body,
    tone: options.tone ?? "neutral",
    duration: options.duration ?? DEFAULT_DURATION,
  };
  if (listeners.size === 0) {
    queued.push(record);
    if (queued.length > MAX_VISIBLE) queued.shift();
    return;
  }
  for (const listener of listeners) listener(record);
}

export type ToastApi = {
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/** The same `toast()` plus `dismiss`, for components that already have hooks. */
export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  return context ?? { toast, dismiss: () => {} };
}

const toneStyles: Record<ToastTone, string> = {
  neutral: "border-line",
  positive: "border-positive/50",
  critical: "border-critical/50",
};

const toneIcon: Record<ToastTone, ReactElement> = {
  neutral: <InfoIcon aria-hidden="true" weight="fill" className="size-4 shrink-0 text-muted" />,
  positive: (
    <CheckCircleIcon aria-hidden="true" weight="fill" className="size-4 shrink-0 text-positive" />
  ),
  critical: (
    <WarningCircleIcon aria-hidden="true" weight="fill" className="size-4 shrink-0 text-critical" />
  ),
};

function ToastItem({
  item,
  onDismiss,
}: {
  item: ToastRecord;
  onDismiss: (id: string) => void;
}): ReactElement {
  const remaining = useRef(item.duration);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    if (timer.current !== null || remaining.current <= 0) return;
    startedAt.current = Date.now();
    timer.current = setTimeout(() => onDismiss(item.id), remaining.current);
  }, [item.id, onDismiss]);

  const pause = useCallback(() => {
    if (timer.current === null) return;
    clearTimeout(timer.current);
    timer.current = null;
    remaining.current -= Date.now() - startedAt.current;
  }, []);

  useEffect(() => {
    start();
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = null;
    };
  }, [start]);

  return (
    <div
      onMouseEnter={pause}
      onMouseLeave={start}
      onFocus={pause}
      onBlur={start}
      className={clsx(
        "toast-item pointer-events-auto flex w-full items-start gap-3 rounded-lg border-(length:--stroke) bg-elevated p-4 shadow-3",
        toneStyles[item.tone],
      )}
    >
      <span className="mt-0.5">{toneIcon[item.tone]}</span>
      <div className="min-w-0 flex-1">
        <p className="text-small font-medium text-ink">{item.title}</p>
        {item.body ? <p className="mt-1 text-small text-muted">{item.body}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss"
        className="btn btn-ghost -mt-1 -mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-input text-muted hover:bg-surface hover:text-ink"
      >
        <XIcon aria-hidden="true" weight="bold" className="size-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }): ReactElement {
  const [items, setItems] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((record: ToastRecord) => {
    setItems((previous) => [...previous, record].slice(-MAX_VISIBLE));
  }, []);

  useEffect(() => {
    listeners.add(push);
    // Replay on the next tick rather than in the effect body: a toast fired
    // during the first render is news from outside React, not render state.
    const replay = setTimeout(() => {
      for (const record of queued.splice(0, queued.length)) push(record);
    }, 0);
    return () => {
      clearTimeout(replay);
      listeners.delete(push);
    };
  }, [push]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:w-96 sm:items-end"
      >
        {items.map((item) => (
          <ToastItem key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
