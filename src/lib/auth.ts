import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { appUrl, authUrl, env, features } from "@/lib/env";

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
  appName: "Clone Template",
  // Replaced by BETTER_AUTH_SECRET in every real deployment. The literal keeps
  // a credential-free `next build` working; it is never a production secret.
  secret: env.BETTER_AUTH_SECRET || "clone-template-insecure-dev-secret",
  baseURL: authUrl,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `<p>Someone asked to reset the password for this account.</p><p><a href="${url}">Choose a new password</a></p><p>If that was not you, ignore this email and nothing changes.</p>`,
        text: `Reset your password: ${url}`,
      });
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
