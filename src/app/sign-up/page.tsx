import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui/card";
import { features } from "@/lib/env";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-20">
      <h1 className="text-3xl">Create your account</h1>
      <p className="mt-2 text-sm text-muted">Free to start. No card needed.</p>

      <Card className="mt-8">
        <AuthForm mode="sign-up" googleEnabled={features.googleOAuth} />
      </Card>

      <p className="mt-6 text-sm text-muted">
        Already have one?{" "}
        <Link href="/sign-in" className="text-ink transition-colors hover:text-accent">
          Sign in
        </Link>
      </p>
    </div>
  );
}
