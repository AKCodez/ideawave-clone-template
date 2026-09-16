import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
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

      <div className="flex flex-wrap justify-between gap-4">
        <Button asChild variant="link" size="sm" className="text-muted hover:text-ink">
          <Link href="/sign-up">Create an account</Link>
        </Button>
        <Button asChild variant="link" size="sm" className="text-muted hover:text-ink">
          <Link href="/forgot-password">Forgot password</Link>
        </Button>
      </div>
    </div>
  );
}
