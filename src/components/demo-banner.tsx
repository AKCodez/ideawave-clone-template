"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import brand from "@/brand";
import { Monogram } from "@/components/brand/monogram";
import { DEMO_LOGIN } from "@/design/types";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "demo-banner-dismissed";

/* Dismissal lives in sessionStorage, which is an external store, so it is read
   through useSyncExternalStore rather than an effect: the server snapshot says
   "dismissed", the first client paint reads the real value, and a hidden
   banner never flashes in and back out. */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function readDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    // Private browsing can throw on read. Showing the banner is the safe side.
    return false;
  }
}

function readDismissedOnServer(): boolean {
  return true;
}

function dismissForThisSession(): void {
  try {
    window.sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // Nothing to do - it simply comes back on the next navigation.
  }
  for (const listener of listeners) listener();
}

type CopyField = "email" | "password";

export type DemoBannerProps = {
  /**
   * `features.demo` from the server. The root layout must pass it:
   *
   * ```tsx
   * <DemoBanner enabled={features.demo} />
   * ```
   *
   * This is a client component, and DEMO_MODE is not a NEXT_PUBLIC variable,
   * so it cannot read the flag itself - on the client it would always come
   * back false and the two renders would disagree. The default is `false` on
   * purpose: a missing banner on a preview is a nuisance, a banner on someone
   * else's production deployment is a leak.
   */
  enabled?: boolean;
};

/**
 * The one place a preview admits what it is: seeded data, a shared login, and
 * a build somebody else's pipeline made.
 *
 * Dismissal is per session, so a reviewer who hides it keeps it hidden while
 * they click around and sees it again next visit - the right default for
 * something whose whole job is to stop a sandbox being mistaken for a live
 * product. This is also the only component allowed to print the demo address.
 */
export function DemoBanner({ enabled = false }: DemoBannerProps) {
  const dismissed = useSyncExternalStore(subscribe, readDismissed, readDismissedOnServer);
  const [copied, setCopied] = useState<CopyField | null>(null);

  useEffect(() => {
    if (copied === null) return;
    const timer = window.setTimeout(() => {
      setCopied(null);
    }, 1600);
    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);

  if (!enabled || dismissed) return null;

  async function copy(field: CopyField, value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(field);
    } catch {
      // No clipboard permission: the value is on screen and selectable anyway.
    }
  }

  const chip =
    "inline-flex items-center gap-1.5 rounded-input border border-line bg-canvas px-2 py-1 " +
    "text-caption text-muted transition-colors duration-150 ease-out-soft " +
    "hover:border-line-strong hover:text-ink";

  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto flex w-full max-w-wide flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
        <Monogram size="sm" />

        <p className="text-small text-muted">
          Preview of <span className="text-ink">{brand.name}</span> built by IdeaWave Clone Studio
        </p>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={cn(chip)}
            aria-label={`Copy the demo email address, ${DEMO_LOGIN.email}`}
            onClick={() => {
              void copy("email", DEMO_LOGIN.email);
            }}
          >
            <span className="numeric">{DEMO_LOGIN.email}</span>
            <span className={copied === "email" ? "text-positive" : "text-faint"}>
              {copied === "email" ? "copied" : "copy"}
            </span>
          </button>

          <button
            type="button"
            className={cn(chip)}
            aria-label="Copy the demo password"
            onClick={() => {
              void copy("password", DEMO_LOGIN.password);
            }}
          >
            <span className="numeric">{DEMO_LOGIN.password}</span>
            <span className={copied === "password" ? "text-positive" : "text-faint"}>
              {copied === "password" ? "copied" : "copy"}
            </span>
          </button>

          <button
            type="button"
            onClick={dismissForThisSession}
            className="rounded-input px-2 py-1 text-caption text-faint transition-colors duration-150 ease-out-soft hover:text-ink"
          >
            Hide
          </button>
        </div>
      </div>
    </div>
  );
}
