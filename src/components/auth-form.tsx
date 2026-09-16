"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export type AuthMode = "sign-in" | "sign-up";

export function AuthForm({
  mode,
  googleEnabled,
}: {
  mode: AuthMode;
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
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
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {mode === "sign-up" ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" placeholder="Your name" />
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            placeholder="At least 8 characters"
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-critical">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending
            ? "Working..."
            : mode === "sign-up"
              ? "Create account"
              : "Sign in"}
        </Button>
      </form>

      {googleEnabled ? (
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => {
            setPending(true);
            void authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
          }}
        >
          Continue with Google
        </Button>
      ) : null}
    </div>
  );
}
