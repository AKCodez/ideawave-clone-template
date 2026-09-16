"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton({ className }: { className?: string }): ReactElement {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="secondary"
      size="sm"
      loading={pending}
      className={className}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      {pending ? null : (
        <SignOutIcon aria-hidden="true" weight="regular" className="size-4" />
      )}
      {pending ? "Signing out" : "Sign out"}
    </Button>
  );
}
