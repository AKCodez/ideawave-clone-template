import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { features } from "@/lib/env";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage(): ReactElement {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-h1 text-ink">Create your account</h1>
        <p className="text-small text-muted">Free to start. No card needed.</p>
      </header>

      <AuthForm mode="sign-up" googleEnabled={features.googleOAuth} />

      <p className="text-small text-muted">
        Already have one?{" "}
        <Link
          href="/sign-in"
          className="text-ink no-underline transition-colors duration-(--duration-1) hover:text-accent"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
