import type { Metadata } from "next";
import Link from "next/link";
import { ResetRequestForm } from "@/components/reset-request-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-20">
      <h1 className="text-3xl">Forgot your password</h1>
      <p className="mt-2 text-sm text-muted">
        We will email a link that lets you choose a new one.
      </p>

      <Card className="mt-8">
        <ResetRequestForm />
      </Card>

      <p className="mt-6 text-sm text-muted">
        <Link href="/sign-in" className="transition-colors hover:text-ink">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
