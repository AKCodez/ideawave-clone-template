import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { features } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage(): ReactElement {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-h1 text-ink">Sign in</h1>
        <p className="text-small text-muted">Pick up where you left off.</p>
      </header>

      <AuthForm mode="sign-in" googleEnabled={features.googleOAuth} />

      <div className="flex flex-wrap justify-between gap-4 text-small text-muted">
        <Link
          href="/sign-up"
          className="no-underline transition-colors duration-(--duration-1) hover:text-ink"
        >
          Create an account
        </Link>
        <Link
          href="/forgot-password"
          className="no-underline transition-colors duration-(--duration-1) hover:text-ink"
        >
          Forgot password
        </Link>
      </div>
    </div>
  );
}
