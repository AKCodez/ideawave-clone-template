import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui/card";
import { features } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-20">
      <h1 className="text-3xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted">Pick up where you left off.</p>

      <Card className="mt-8">
        <AuthForm mode="sign-in" googleEnabled={features.googleOAuth} />
      </Card>

      <div className="mt-6 flex justify-between text-sm text-muted">
        <Link href="/sign-up" className="transition-colors hover:text-ink">
          Create an account
        </Link>
        <Link href="/forgot-password" className="transition-colors hover:text-ink">
          Forgot password
        </Link>
      </div>
    </div>
  );
}
