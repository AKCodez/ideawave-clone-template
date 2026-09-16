"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Browser-side Better Auth client.
 *
 * baseURL is deliberately omitted so the client always calls the origin it was
 * served from. A baked-in NEXT_PUBLIC_APP_URL would point a preview deployment
 * at the wrong host.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
