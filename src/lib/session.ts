import { cache } from "react";
import { headers } from "next/headers";
import { auth, type Session } from "@/lib/auth";
import { features } from "@/lib/env";

/**
 * Read the signed-in session on the server. Cached per request, so calling it
 * in a layout and again in a page costs one lookup.
 *
 * With no database configured there is no session to read, and a database that
 * is unreachable reads as signed out rather than a 500 - a preview deployment
 * should still render its marketing pages.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  // Read headers first: it is what marks a page that checks the session as
  // dynamic, and it must happen even on a build with no database configured.
  const requestHeaders = await headers();
  if (!features.db) return null;
  try {
    return await auth.api.getSession({ headers: requestHeaders });
  } catch (error) {
    console.error("[session] failed to read session", error);
    return null;
  }
});

export const getCurrentUser = cache(async (): Promise<Session["user"] | null> => {
  const session = await getSession();
  return session?.user ?? null;
});
