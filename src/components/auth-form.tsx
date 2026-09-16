"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactElement } from "react";
import { GoogleLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export type AuthMode = "sign-in" | "sign-up";

export function AuthForm({
  mode,
  googleEnabled,
}: {
  mode: AuthMode;
  googleEnabled: boolean;
}): ReactElement {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({ email, password, name: name || email })
        : await authClient.signIn.email({ email, password });

    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "That did not work. Check the details and retry.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {mode === "sign-up" ? (
          <Field id="auth-name" label="Name">
            <Input name="name" autoComplete="name" placeholder="Your name" />
          </Field>
        ) : null}

        <Field id="auth-email" label="Email">
          <Input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
          />
        </Field>

        <Field
          id="auth-password"
          label="Password"
          hint={mode === "sign-up" ? "At least 8 characters." : undefined}
          error={error ?? undefined}
        >
          <Input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            placeholder="At least 8 characters"
          />
        </Field>

        <Button type="submit" size="lg" loading={pending} className="w-full">
          {mode === "sign-up" ? "Create account" : "Sign in"}
        </Button>
      </form>

      {googleEnabled ? (
        <>
          <p className="text-center text-caption text-faint">or</p>
          <Button
            variant="secondary"
            size="lg"
            disabled={pending}
            className="w-full"
            onClick={() => {
              setPending(true);
              void authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
            }}
          >
            <GoogleLogoIcon aria-hidden="true" weight="bold" className="size-4" />
            Continue with Google
          </Button>
        </>
      ) : null}
    </div>
  );
}
