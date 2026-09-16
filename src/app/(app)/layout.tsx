import type { ReactElement, ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/session";

/**
 * The gate for everything signed in. The session is read once here, so no page
 * in this group has to repeat the check to draw its own chrome, and a signed
 * out visitor never sees a flash of an app they cannot use.
 *
 * Server Actions still do their own auth check. A layout is navigation, not a
 * permission system.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<ReactElement> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <AppShell user={{ name: user.name, email: user.email }}>{children}</AppShell>
  );
}
