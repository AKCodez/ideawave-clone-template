import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { GearIcon, SquaresFourIcon } from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "@/components/brand/wordmark";
import { NavLinks, NavSheet, type NavItem } from "@/components/nav-sheet";
import { SignOutButton } from "@/components/sign-out-button";
import { Avatar } from "@/components/ui/avatar";

/**
 * The signed-in shell: a sidebar from lg up, a top bar with the same links in a
 * sheet below it. The session is read once, in the (app) layout, and handed
 * down - no page inside the shell repeats the check to render its chrome.
 */
const NAV: readonly NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <SquaresFourIcon aria-hidden="true" weight="regular" className="size-4 shrink-0" />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <GearIcon aria-hidden="true" weight="regular" className="size-4 shrink-0" />,
  },
];

export type AppShellUser = {
  name?: string | null;
  email: string;
};

export type AppShellProps = {
  user: AppShellUser;
  children: ReactNode;
};

function UserBlock({ user }: { user: AppShellUser }): ReactElement {
  return (
    <div className="flex flex-col gap-3 border-t-(length:--stroke) border-line pt-4">
      <div className="flex items-center gap-3">
        <Avatar name={user.name || user.email} size="sm" />
        <span className="min-w-0 flex-1 truncate text-small text-muted">{user.email}</span>
      </div>
      <SignOutButton className="w-full justify-start" />
    </div>
  );
}

export function AppShell({ user, children }: AppShellProps): ReactElement {
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r-(length:--stroke) lg:border-line lg:bg-surface">
        <div className="sticky top-0 flex h-screen flex-col gap-6 p-5">
          <Link href="/dashboard" className="no-underline">
            <Wordmark size="md" />
          </Link>
          <NavLinks items={NAV} orientation="column" className="flex-1" />
          <UserBlock user={user} />
        </div>
      </aside>

      <header className="flex items-center justify-between gap-4 border-b-(length:--stroke) border-line bg-surface px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="no-underline">
          <Wordmark size="sm" />
        </Link>
        <NavSheet items={NAV} title="Menu">
          <UserBlock user={user} />
        </NavSheet>
      </header>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div className="mx-auto w-full max-w-content">{children}</div>
      </main>
    </div>
  );
}
