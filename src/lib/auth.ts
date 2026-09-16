import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { renderPasswordResetEmail, sendEmail } from "@/lib/email";
import { appName, appUrl, authUrl, env, features } from "@/lib/env";

/**
 * Better Auth on our own Postgres through the Prisma adapter. Sessions are read
 * server-side; there is no third-party auth SaaS in this stack.
 *
 * Google is spread in only when both OAuth credentials exist, so a deployment
 * without them still signs users in with email and password.
 */
const socialProviders = features.googleOAuth
  ? {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    }
  : {};

export const auth = betterAuth({
  appName,
  // Replaced by BETTER_AUTH_SECRET in every real deployment. The literal keeps
  // a credential-free `next build` working; it is never a production secret.
  secret: env.BETTER_AUTH_SECRET || "insecure-build-only-secret",
  baseURL: authUrl,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      const { subject, html, text } = renderPasswordResetEmail(url);
      await sendEmail({ to: user.email, subject, html, text });
    },
  },
  socialProviders,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
  trustedOrigins: [...new Set([authUrl, appUrl])],
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
