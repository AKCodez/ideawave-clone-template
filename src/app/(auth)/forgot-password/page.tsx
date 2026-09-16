import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { ResetRequestForm } from "@/components/reset-request-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage(): ReactElement {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-h1 text-ink">Forgot your password</h1>
        <p className="text-small text-muted">
          We will email a link that lets you choose a new one.
        </p>
      </header>

      <ResetRequestForm />

      <p className="text-small text-muted">
        <Link
          href="/sign-in"
          className="no-underline transition-colors duration-(--duration-1) hover:text-ink"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
